import { zodResolver } from '@hookform/resolvers/zod';
import { zOnboardingProject } from '@openpanel/core/modules/onboarding/onboarding.constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  MonitorIcon,
  SaveIcon,
  ServerIcon,
  SmartphoneIcon,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { popModal } from '.';
import { ModalContent, ModalHeader } from './Modal/Container';
import AnimateHeight from '@/components/animate-height';
import { CreateClientSuccess } from '@/components/clients/create-client-success';
import { CheckboxItem } from '@/components/forms/checkbox-item';
import { InputWithLabel, WithLabel } from '@/components/forms/input-with-label';
import TagInput from '@/components/forms/tag-input';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useAppParams } from '@/hooks/use-app-params';
import { rememberOnboardingKeys } from '@/hooks/use-client-secret';
import { handleError, useTRPC } from '@/integrations/trpc/react';
import { toOrigin } from '@/utils/origin';

const validator = zOnboardingProject;
type IForm = z.infer<typeof validator>;

export default function AddProject() {
  const { organizationId } = useAppParams();
  const navigate = useNavigate();
  const form = useForm<IForm>({
    resolver: zodResolver(validator),
    defaultValues: {
      organizationId,
      project: '',
      domain: '',
      cors: [],
      website: false,
      app: false,
      backend: false,
    },
  });
  // The domain's origin is kept in "Allowed domains" as it is typed (a website
  // with none refuses every browser event); origins added by hand stay.
  const mirroredOrigin = useRef<string | null>(null);
  const domainField = form.register('domain');
  const mirrorDomain = (domain: string) => {
    const next = domain.includes('.') ? toOrigin(domain) : null;
    const previous = mirroredOrigin.current;
    mirroredOrigin.current = next;
    const kept = form.getValues().cors.filter((origin) => origin !== previous);
    form.setValue(
      'cors',
      next && !kept.includes(next) ? [next, ...kept] : kept
    );
  };
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    trpc.project.create.mutationOptions({
      onError: handleError,
      onSuccess: (res) => {
        queryClient.invalidateQueries(
          trpc.project.list.queryFilter({ organizationId })
        );
        toast.success('Project created', {
          description: `${res.name}`,
          action: {
            label: 'View project',
            onClick: () =>
              navigate({
                to: '/$organizationId/$projectId',
                params: {
                  organizationId,
                  projectId: res.id,
                },
              }),
          },
        });
      },
    })
  );

  const onSubmit = (values: IForm) => {
    mutation.mutate(values);
  };

  const isWebsite = useWatch({
    name: 'website',
    control: form.control,
  });

  const isApp = useWatch({
    name: 'app',
    control: form.control,
  });

  const isBackend = useWatch({
    name: 'backend',
    control: form.control,
  });

  useEffect(() => {
    if (!isWebsite) {
      form.setValue('domain', null);
      form.setValue('cors', []);
      mirroredOrigin.current = null;
    }
  }, [isWebsite, form]);

  useEffect(() => {
    form.clearErrors();
  }, [isWebsite, isApp, isBackend]);

  return (
    <ModalContent>
      {mutation.isSuccess ? (
        <>
          <ModalHeader text={'Your project is created'} title="Success" />
          {mutation.data.client && (
            <CreateClientSuccess {...mutation.data.client} />
          )}
          <DialogFooter>
            <Button onClick={() => popModal()} variant="outline">
              Close
            </Button>
            {/* Route through the same connect -> verify steps as onboarding so
                a second project doesn't skip the install instructions. The
                connect page reads the secret from sessionStorage — seed it
                here, since this is the only moment the plain secret exists. */}
            <Button asChild className="flex-1">
              <a
                href={`/onboarding/${mutation.data.id}/connect`}
                onClick={() =>
                  rememberOnboardingKeys(mutation.data.id, {
                    clientSecret: mutation.data.client?.secret,
                  })
                }
              >
                Set up tracking
              </a>
            </Button>
          </DialogFooter>
        </>
      ) : (
        <>
          <ModalHeader title="Create project" />
          <form className="col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <InputWithLabel
              label="Project name"
              placeholder="Eg. My music site"
              {...form.register('project')}
              error={form.formState.errors.project?.message}
            />

            <div className="flex flex-col divide-y">
              <Controller
                control={form.control}
                name="website"
                render={({ field }) => (
                  <CheckboxItem
                    description="Track events and conversion for your website"
                    disabled={isApp}
                    error={form.formState.errors.website?.message}
                    Icon={MonitorIcon}
                    label="Website"
                    {...field}
                  >
                    <AnimateHeight open={isWebsite && !isApp}>
                      <div className="p-4 pl-14">
                        <InputWithLabel
                          label="Domain"
                          placeholder="https://example.com"
                          {...domainField}
                          className="mb-4"
                          error={form.formState.errors.domain?.message}
                          hint="The address of the site you will track."
                          onBlur={(e) => {
                            domainField.onBlur(e);
                            const value = toOrigin(e.target.value);
                            if (value) {
                              form.setValue('domain', value, {
                                shouldValidate: true,
                              });
                            }
                          }}
                          onChange={(e) => {
                            domainField.onChange(e);
                            mirrorDomain(e.target.value);
                          }}
                        />

                        <Controller
                          control={form.control}
                          name="cors"
                          render={({ field }) => (
                            <WithLabel
                              id="project-cors"
                              hint="Sites allowed to send events to this project. Your domain is added for you; add any other domain that runs the same tracking code."
                              label="Allowed domains"
                            >
                              <TagInput
                                {...field}
                                error={form.formState.errors.cors?.message}
                                id="project-cors"
                                onChange={(newValue) => {
                                  field.onChange([
                                    ...new Set(newValue.map(toOrigin)),
                                  ]);
                                }}
                                placeholder="Accept events from these domains"
                                renderTag={(tag) =>
                                  tag === '*'
                                    ? 'Accept events from any domains'
                                    : tag
                                }
                                value={field.value ?? []}
                              />
                            </WithLabel>
                          )}
                        />
                      </div>
                    </AnimateHeight>
                  </CheckboxItem>
                )}
              />
              <Controller
                control={form.control}
                name="app"
                render={({ field }) => (
                  <CheckboxItem
                    description="Track events and conversion for your app"
                    disabled={isWebsite}
                    error={form.formState.errors.app?.message}
                    Icon={SmartphoneIcon}
                    label="App"
                    {...field}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="backend"
                render={({ field }) => (
                  <CheckboxItem
                    description="Track events and conversion for your backend / API"
                    error={form.formState.errors.backend?.message}
                    Icon={ServerIcon}
                    label="Backend / API"
                    {...field}
                  />
                )}
              />
            </div>

            <DialogFooter>
              <Button
                icon={SaveIcon}
                loading={mutation.isPending}
                type="submit"
              >
                Create project
              </Button>
            </DialogFooter>
          </form>
        </>
      )}
    </ModalContent>
  );
}
