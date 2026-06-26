/**
 * app/forgot-password/page.tsx — Forgot Password Page (Server Component)
 */
import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata = {
  title: "Forgot Password",
  description: "Request a password recovery link to restore access to your LUNORA dashboard.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCardWrapper
      title="Recover Password"
      subtitle="Enter your email below and we will send you a recovery link."
      quote="Simplicity is the ultimate sophistication. Carry your essentials effortlessly."
      quoteAuthor="LUNORA Creative Director"
    >
      <ForgotForm />
    </AuthCardWrapper>
  );
}
