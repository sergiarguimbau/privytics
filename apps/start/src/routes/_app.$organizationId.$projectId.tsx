import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useProjectDocumentTitle } from '@/hooks/use-project-document-title';
import { useTRPC } from '@/integrations/trpc/react';
import { createProjectTitle, PAGE_TITLES } from '@/utils/title';

export const Route = createFileRoute('/_app/$organizationId/$projectId')({
  component: ProjectDashboard,
  head: () => {
    return {
      meta: [
        {
          title: createProjectTitle(PAGE_TITLES.DASHBOARD),
        },
      ],
    };
  },
  loader: async ({ context, params }) => {
    const projectQuery =
      context.trpc.project.getProjectWithClients.queryOptions({
        projectId: params.projectId,
      });
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.organization.get.queryOptions({
          organizationId: params.organizationId,
        })
      ),
      context.queryClient.prefetchQuery(projectQuery),
    ]);
    // Keep the URL's organization the one that owns the project, so every
    // organization-scoped read below the project (usage, billing banner) is
    // the right one.
    const project = context.queryClient.getQueryData(projectQuery.queryKey);
    if (project && project.organizationId !== params.organizationId) {
      throw redirect({
        to: '/$organizationId/$projectId',
        params: {
          organizationId: project.organizationId,
          projectId: params.projectId,
        },
      });
    }
  },
});

function ProjectDashboard() {
  const { projectId } = Route.useParams();
  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.project.getProjectWithClients.queryOptions({ projectId })
  );
  useProjectDocumentTitle(project?.name);

  // Privytics never blocks the dashboard on billing state: the free tier is
  // the floor, so every organization keeps access, capped at the free event
  // limit. Upstream blocked here both on `FREE_PRODUCT_IDS` and on the
  // expired/trial/paused states, none of which applies to us.
  return <Outlet />;
}
