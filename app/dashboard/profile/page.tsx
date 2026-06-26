/**
 * app/dashboard/profile/page.tsx — Profile settings panel
 *
 * Client Component for edit profile and password change forms.
 */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/auth-context";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

// Schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmNewPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

type ProfileFields = z.infer<typeof profileSchema>;
type PasswordFields = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Forms setup
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordFields>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Action handlers
  const onProfileUpdate = async (data: ProfileFields) => {
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const res = await updateProfile(data.name, data.email, data.phone);
      if (res.success) {
        setProfileSuccess(res.message);
        setTimeout(() => setProfileSuccess(null), 3000);
      } else {
        setProfileError(res.message);
      }
    } catch {
      setProfileError("Something went wrong updating your profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordChange = async (data: PasswordFields) => {
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      // Simulate password change API latency
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Mock validation
      if (data.currentPassword === "password123") {
        setPasswordSuccess("Password updated successfully!");
        resetPasswordForm();
        setTimeout(() => setPasswordSuccess(null), 3000);
      } else {
        setPasswordError("Incorrect current password.");
      }
    } catch {
      setPasswordError("Failed to update password. Try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Personal Details Form ── */}
      <div className="rounded-xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Account Details</h2>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          Update your public profile details and personal credentials.
        </p>

        <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="mt-6 space-y-4 max-w-xl">
          {profileSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
              <CheckCircle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800 dark:bg-red-950/20 dark:text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <InputField
            label="Full Name"
            type="text"
            error={profileErrors.name?.message}
            disabled={profileLoading}
            {...registerProfile("name")}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Email Address"
              type="email"
              error={profileErrors.email?.message}
              disabled={profileLoading}
              {...registerProfile("email")}
            />
            <InputField
              label="Phone Number"
              type="tel"
              error={profileErrors.phone?.message}
              disabled={profileLoading}
              {...registerProfile("phone")}
            />
          </div>

          <Button
            type="submit"
            isLoading={profileLoading}
            loadingText="Saving profile..."
            className="px-6 py-2.5 text-xs"
          >
            Save Changes
          </Button>
        </form>
      </div>

      {/* ── Security / Password Form ── */}
      <div className="rounded-xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Change Password</h2>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          Set a secure, strong password to protect your user log data.
        </p>

        <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="mt-6 space-y-4 max-w-xl">
          {passwordSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
              <CheckCircle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800 dark:bg-red-950/20 dark:text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <InputField
            label="Current Password"
            type="password"
            placeholder="••••••••"
            error={passwordErrors.currentPassword?.message}
            disabled={passwordLoading}
            {...registerPassword("currentPassword")}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={passwordErrors.newPassword?.message}
              disabled={passwordLoading}
              {...registerPassword("newPassword")}
            />
            <InputField
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              error={passwordErrors.confirmNewPassword?.message}
              disabled={passwordLoading}
              {...registerPassword("confirmNewPassword")}
            />
          </div>

          <Button
            type="submit"
            isLoading={passwordLoading}
            loadingText="Saving password..."
            className="px-6 py-2.5 text-xs"
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
