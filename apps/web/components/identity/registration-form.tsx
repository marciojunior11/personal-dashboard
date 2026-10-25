"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { hasIssues } from "@personal-dashboard/shared/utils";
import {
  registerInputSchema,
  type IRegisterInput,
  type IUserOutput,
} from "@personal-dashboard/shared/identity";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { postJson } from "@/lib/api";
import { ClientMessage } from "@/lib/messages";

/** Sign-up page: the form that creates a professional's account. */
export function RegistrationForm() {
  const form = useForm<IRegisterInput>({
    resolver: zodResolver(registerInputSchema),
    defaultValues: {
      nomeCompleto: "",
      dataNascimento: "",
      email: undefined,
      celular: undefined,
      senha: "",
      confirmacaoSenha: "",
    },
  });

  async function onSubmit(data: IRegisterInput) {
    const result = await postJson<IUserOutput>("/auth/register", data).catch(
      () => null,
    );
    if (result === null) {
      toast.error(ClientMessage.API_UNREACHABLE);
      return;
    }

    if (result.isSuccess) {
      toast.success("Conta criada com sucesso!");
      form.reset();
      return;
    }

    // An error tied to fields shows next to each one, whatever its category;
    // anything else goes to a toast.
    const { error } = result;
    if (hasIssues(error)) {
      for (const issue of error.issues) {
        form.setError(issue.field as keyof IRegisterInput, {
          type: issue.code,
          message: issue.message,
        });
      }
      return;
    }

    toast.error(error?.message ?? ClientMessage.API_UNREACHABLE);
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>
            Preencha seus dados para começar a gerenciar seus alunos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="registration-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="nomeCompleto"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nome completo</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Maria da Silva"
                      autoComplete="name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="dataNascimento"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Data de nascimento
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="date"
                      aria-invalid={fieldState.invalid}
                      autoComplete="bday"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {/*
               * E-mail and phone are optional, but an empty input yields "",
               * which the schema would reject as invalid. An empty input is
               * stored as `undefined` instead, which the schema reads as
               * "not informed".
               */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(event.target.value || undefined)
                      }
                      id={field.name}
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="maria@email.com"
                      autoComplete="email"
                    />
                    <FieldDescription>
                      Informe ao menos um e-mail ou celular.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="celular"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Celular</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(event.target.value || undefined)
                      }
                      id={field.name}
                      type="tel"
                      aria-invalid={fieldState.invalid}
                      placeholder="(11) 98765-4321"
                      autoComplete="tel"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="senha"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Senha</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      aria-invalid={fieldState.invalid}
                      autoComplete="new-password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="confirmacaoSenha"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Confirmação de senha
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      aria-invalid={fieldState.invalid}
                      autoComplete="new-password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Limpar
            </Button>
            <Button
              type="submit"
              form="registration-form"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Criando conta..." : "Criar conta"}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
