/**
 * components/auth/forgot-form.tsx — Request recovery link form
 */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { Check, Mail } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFields = z.infer<typeof forgotSchema>;

export function ForgotForm() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFields>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotFields) => {
    setLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
          <Mail className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Email Sent</h3>
        <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed dark:text-neutral-400">
          We have sent a secure recovery link to your registered address. Please check your inbox (and spam folder) to set a new password.
        </p>
        <Link
          href="/login"
          className="inline-block mt-4 text-xs font-bold text-neutral-900 underline hover:no-underline dark:text-white"
        >
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField
        label="Email Address"
        type="email"
        placeholder="aarushi.goel@example.com"
        error={errors.email?.message}
        disabled={loading}
        {...register("email")}
      />

      <Button
        type="submit"
        isLoading={loading}
        loadingText="Sending reset link..."
        className="w-full h-11"
      >
        Send Recovery Link
      </Button>

      <div className="text-center text-xs">
        <Link
          href="/login"
          className="font-bold text-neutral-900 hover:underline dark:text-white"
        >
          Return to login
        </Link>
      </div>
    </form>
  );
}
