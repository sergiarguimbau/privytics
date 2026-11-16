// `enforceAccess` only sees a top-level `projectId` / `organizationId`, so
// anything resolved from another id needs its own explicit check in the handler.

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../rpc/base';
import { TRPCBadRequestError, TRPCNotFoundError } from '../../rpc/errors';
import type { ServiceDeps } from '../../services';
import { type IImportConfig, zCreateImport } from './import.constants';
import { canImport } from './import.routes';
import {
  requireMappedProjectsWriteAccess,
  toPublicImport,
} from './import.service';

const IMPORT_REQUIRES_PAID_PLAN =
  'You cannot start an import without an active subscription!';

/**
 * Privytics: an Umami import also writes into every mapped project, which can
 * belong to another organization. Each receiving organization must be allowed
 * to import, or a paid org's import could fill a free org past its hard cap.
 */
async function requireMappedOrganizationsCanImport(
  ctx: Pick<ServiceDeps, 'db' | 'config'>,
  projectId: string,
  config: IImportConfig
): Promise<void> {
  if (!('projectMapper' in config)) {
    return;
  }
  const mappedProjectIds = [
    ...new Set(config.projectMapper.map(({ to }) => to)),
  ].filter((id) => id !== projectId);
  if (mappedProjectIds.length === 0) {
    return;
  }
  const organizations = await ctx.db.organization.findMany({
    where: { projects: { some: { id: { in: mappedProjectIds } } } },
  });
  for (const organization of organizations) {
    if (!canImport(organization, ctx.config.selfHosted)) {
      throw new TRPCBadRequestError(IMPORT_REQUIRES_PAID_PLAN);
    }
  }
}

export const importRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.userId;
      await ctx.services.auth.requireProjectAccess({
        userId,
        projectId: input.projectId,
        level: 'read',
      });

      const imports = await ctx.db.import.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: 'desc' },
      });
      return imports.map(toPublicImport);
    }),

  create: protectedProcedure
    .input(zCreateImport)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.userId;
      await ctx.services.auth.requireProjectAccess({
        userId,
        projectId: input.projectId,
        level: 'write',
      });
      await requireMappedProjectsWriteAccess(
        ctx.services.auth,
        userId,
        input.config
      );

      const db = ctx.db;
      const organization = await db.organization.findFirst({
        where: { projects: { some: { id: input.projectId } } },
      });

      if (!organization) {
        throw new TRPCNotFoundError(
          'Could not start import, organization not found'
        );
      }

      if (!canImport(organization, ctx.config.selfHosted)) {
        throw new TRPCBadRequestError(IMPORT_REQUIRES_PAID_PLAN);
      }
      await requireMappedOrganizationsCanImport(
        ctx,
        input.projectId,
        input.config
      );

      const importRecord = await db.import.create({
        data: {
          projectId: input.projectId,
          config: input.config,
          status: 'pending',
        },
      });

      const jobId = await ctx.services.import.enqueue(importRecord.id);

      await db.import.update({
        where: { id: importRecord.id },
        data: { jobId },
      });

      return toPublicImport({ ...importRecord, jobId });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.userId;
      const db = ctx.db;
      const importRecord = await db.import.findUniqueOrThrow({
        where: { id: input.id },
      });

      await ctx.services.auth.requireProjectAccess({
        userId,
        projectId: importRecord.projectId,
        level: 'write',
      });

      if (importRecord.jobId) {
        await ctx.queues.import.import.remove(importRecord.jobId);
      }

      return toPublicImport(
        await db.import.delete({ where: { id: input.id } })
      );
    }),

  retry: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.userId;
      const db = ctx.db;
      const importRecord = await db.import.findUniqueOrThrow({
        where: { id: input.id },
      });

      await ctx.services.auth.requireProjectAccess({
        userId,
        projectId: importRecord.projectId,
        level: 'write',
      });

      await requireMappedProjectsWriteAccess(
        ctx.services.auth,
        userId,
        importRecord.config
      );

      if (importRecord.status !== 'failed') {
        throw new Error('Only failed imports can be retried');
      }

      const organization = await db.organization.findFirst({
        where: { projects: { some: { id: importRecord.projectId } } },
      });
      if (!canImport(organization, ctx.config.selfHosted)) {
        throw new TRPCBadRequestError(IMPORT_REQUIRES_PAID_PLAN);
      }
      await requireMappedOrganizationsCanImport(
        ctx,
        importRecord.projectId,
        importRecord.config
      );

      const jobId = await ctx.services.import.enqueue(importRecord.id);

      return toPublicImport(
        await db.import.update({
          where: { id: importRecord.id },
          data: { jobId, status: 'pending', errorMessage: null },
        })
      );
    }),
});
