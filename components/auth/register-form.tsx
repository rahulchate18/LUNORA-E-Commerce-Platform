/**
 * components/auth/register-form.tsx — Sign up form with password confirmation checks
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

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFields = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: signup } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFields) => {
    setLoading(true);
    setFormError(null);
    try {
      const res = await signup(data.name, data.email, data.password);
      if (res.success) {
        setFormSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setFormError(res.message);
      }
    } catch {
      setFormError("Failed to register. Please try again.");
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
          <span>Account created! Sending you to your dashboard...</span>
        </div>
      )}

      <InputField
        label="Full Name"
        type="text"
        placeholder="Aarushi Goel"
        error={errors.name?.message}
        disabled={loading || formSuccess}
        {...register("name")}
      />

      <InputField
        label="Email Address"
        type="email"
        placeholder="aarushi.goel@example.com"
        error={errors.email?.message}
        disabled={loading || formSuccess}
        {...register("email")}
      />

      <InputField
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        disabled={loading || formSuccess}
        {...register("password")}
      />

      <InputField
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        disabled={loading || formSuccess}
        {...register("confirmPassword")}
      />

      <Button
        type="submit"
        isLoading={loading || formSuccess}
        loadingText="Creating account..."
        className="w-full h-11"
      >
        Create Account
      </Button>

      <div className="text-center text-xs text-neutral-500 dark:text-neutral-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-neutral-900 hover:underline dark:text-white"
        >
          Sign In
        </Link>
      </div>
    </form>
  );
}
