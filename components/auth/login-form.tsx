/**
 * components/auth/login-form.tsx — Valided login credentials card
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFields = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFields) => {
    setLoading(true);
    setFormError(null);
    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        setFormSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        setFormError(res.message);
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {formError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-xs font-medium text-red-800 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {formSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
          <Check className="h-4.5 w-4.5 flex-shrink-0" />
          <span>Sign in successful! Sending you to the store...</span>
        </div>
      )}

      <InputField
        label="Email Address"
        type="email"
        placeholder="aarushi.goel@example.com"
        error={errors.email?.message}
        disabled={loading || formSuccess}
        {...register("email")}
      />

      <div className="space-y-1">
        <InputField
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          disabled={loading || formSuccess}
          {...register("password")}
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-950 underline transition-colors dark:text-neutral-400 dark:hover:text-white"
          >
            Forgot Password?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        isLoading={loading || formSuccess}
        loadingText="Signing in..."
        className="w-full h-11"
      >
        Sign In
      </Button>

      <div className="text-center text-xs text-neutral-500 dark:text-neutral-400">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-neutral-900 hover:underline dark:text-white"
        >
          Sign Up
        </Link>
      </div>
    </form>
  );
}
