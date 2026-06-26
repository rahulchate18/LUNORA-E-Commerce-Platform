/**
 * components/auth/reset-form.tsx — Set new password form
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const resetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFields = z.infer<typeof resetSchema>;

export function ResetForm() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFields>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetFields) => {
    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
          <Check className="h-4.5 w-4.5 flex-shrink-0" />
          <span>Password reset successfully! Redirecting to login...</span>
        </div>
      )}

      <InputField
        label="New Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        disabled={loading || success}
        {...register("password")}
      />

      <InputField
        label="Confirm New Password"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        disabled={loading || success}
        {...register("confirmPassword")}
      />

      <Button
        type="submit"
        isLoading={loading || success}
        loadingText="Saving password..."
        className="w-full h-11"
      >
        Reset Password
      </Button>
    </form>
  );
}
