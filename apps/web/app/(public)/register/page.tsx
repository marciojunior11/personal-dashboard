import type { Metadata } from "next";
import { RegistrationForm } from "@/components/identity/registration-form";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function RegisterPage() {
  return <RegistrationForm />;
}
