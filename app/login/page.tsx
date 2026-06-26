/**
 * app/login/page.tsx — Login Page (Server Component)
 */
import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In",
  description: "Sign in to your LUNORA account to manage orders, addresses, and account details.",
};

export default function LoginPage() {
  return (
    <AuthCardWrapper
      title="Welcome Back"
      subtitle="Enter your credentials to access your customer dashboard."
      quote="Elegant structure. Effortless function. The hallmark of a modern classic."
      quoteAuthor="LUNORA Design Studio"
    >
      <LoginForm />
    </AuthCardWrapper>
  );
}
