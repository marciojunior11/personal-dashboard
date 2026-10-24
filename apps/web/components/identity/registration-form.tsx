"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerInputSchema,
  type IRegisterInput,
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

  function onSubmit(data: IRegisterInput) {
    // The passwords are left out of the preview on purpose.
    const { senha: _senha, confirmacaoSenha: _confirmacao, ...preview } = data;
    toast("Você enviou os seguintes dados:", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-muted p-4">
          <code>{JSON.stringify(preview, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
    });
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
            <Button type="submit" form="registration-form">
              Criar conta
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
