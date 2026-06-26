/**
 * app/reset-password/page.tsx — Reset Password Page (Server Component)
 */
import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper";
import { ResetForm } from "@/components/auth/reset-form";

export const metadata = {
  title: "Reset Password",
  description: "Set a new password to secure your LUNORA customer account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthCardWrapper
      title="Create New Password"
      subtitle="Choose a secure, strong password you don't use elsewhere."
      quote="Crafted for lifetime utility. Beautiful inside and out."
      quoteAuthor="LUNORA Quality Control"
    >
      <ResetForm />
    </AuthCardWrapper>
  );
}
