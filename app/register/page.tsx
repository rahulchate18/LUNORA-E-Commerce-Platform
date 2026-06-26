/**
 * app/register/page.tsx — Registration Page (Server Component)
 */
import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Create Account",
  description: "Join LUNORA and manage your shopping preferences, order deliveries, and accessories collections.",
};

export default function RegisterPage() {
  return (
    <AuthCardWrapper
      title="Create Account"
      subtitle="Register below to save your details and checkout faster."
      quote="Every detail refined. Handcrafted leather finishes that get better with age."
      quoteAuthor="LUNORA Quality Assurance"
    >
      <RegisterForm />
    </AuthCardWrapper>
  );
}
