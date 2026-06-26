/**
 * app/admin/coupons/page.tsx — Admin Coupon Rules Manager
 *
 * Client Component that consumes AdminContext.
 */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdmin, type CouponRule } from "@/context/admin-context";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { Ticket, Plus, Trash2, X, Check, ShieldAlert, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Schema validation
const couponFormSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon code must be at least 3 characters")
    .regex(/^[A-Z0-9]+$/, "Code must contain only uppercase letters and numbers")
    .toUpperCase(),
  discount: z.coerce.number().min(1, "Discount value must be at least 1"),
  type: z.enum(["flat", "percent"] as const),
  minSpend: z.coerce.number().optional(),
});

type CouponFormFields = z.infer<typeof couponFormSchema>;

export default function AdminCouponsPage() {
  const { coupons, addCoupon, toggleCouponActive, deleteCoupon } = useAdmin();

  // Create form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Actions loading tracking
  const [actionsLoading, setActionsLoading] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: "",
      discount: "" as any,
      type: "percent" as const,
      minSpend: "" as any,
    },
  });

  const handleOpenModal = () => {
    reset({
      code: "",
      discount: "" as any,
      type: "percent",
      minSpend: "" as any,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError(null);
  };

  const onSubmit = async (data: any) => {
    const formData = data as CouponFormFields;
    setModalLoading(true);
    setFormError(null);
    try {
      const res = await addCoupon({
        code: formData.code,
        discount: formData.discount,
        type: formData.type,
        minSpend: formData.minSpend,
        isActive: true, // Default active on creation
      });

      if (res.success) {
        setFormSuccess(res.message);
        setTimeout(() => {
          setFormSuccess(null);
          handleCloseModal();
        }, 1000);
      } else {
        setFormError(res.message);
      }
    } catch {
      setFormError("Failed to create coupon code rule.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleActive = async (code: string) => {
    setActionsLoading((prev) => ({ ...prev, [code]: true }));
    try {
      await toggleCouponActive(code);
    } finally {
      setActionsLoading((prev) => ({ ...prev, [code]: false }));
    }
  };

  const handleDelete = async (code: string) => {
    setActionsLoading((prev) => ({ ...prev, [code]: true }));
    try {
      await deleteCoupon(code);
    } finally {
      setActionsLoading((prev) => ({ ...prev, [code]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Store Coupons</h2>
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            Define promotional discount codes, minimum purchase requirements, and active ranges.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          <Plus className="h-4 w-4" />
          <span>Add Coupon</span>
        </button>
      </div>

      {/* Coupons Table List */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/50">
                <th className="py-3 px-6 font-semibold uppercase tracking-wider">Coupon Code</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Discount Rate</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Min Spend</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
              {coupons.map((c) => {
                const isLoading = actionsLoading[c.code];
                return (
                  <tr key={c.code} className="text-neutral-700 dark:text-neutral-300">
                    <td className="py-4 px-6 font-mono text-sm font-bold text-neutral-900 dark:text-white">
                      {c.code}
                    </td>
                    <td className="py-4 px-4 font-semibold">
                      {c.type === "flat" ? `₹${c.discount}` : `${c.discount}%`}
                    </td>
                    <td className="py-4 px-4 capitalize">
                      {c.type === "flat" ? "Flat INR Discount" : "Percentage"}
                    </td>
                    <td className="py-4 px-4 text-neutral-400">
                      {c.minSpend ? `₹${c.minSpend}` : "None"}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold leading-none capitalize",
                          c.isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                            : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                        )}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2.5">
                      <button
                        onClick={() => handleToggleActive(c.code)}
                        disabled={isLoading}
                        className={cn(
                          "inline-flex items-center gap-1 font-semibold transition-colors text-xs underline",
                          c.isActive
                            ? "text-neutral-500 hover:text-neutral-900"
                            : "text-emerald-600 hover:text-emerald-800"
                        )}
                      >
                        {c.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(c.code)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1 font-semibold text-red-500 hover:text-red-700 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Coupon Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => !modalLoading && handleCloseModal()}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-950 animate-scale-in">
            {/* Close */}
            {!modalLoading && (
              <button
                onClick={handleCloseModal}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-50 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Create Coupon</h3>
            <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
              Set code and rules details.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              {formSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
                  <Check className="h-4.5 w-4.5" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-800 dark:bg-red-950/20 dark:text-red-400">
                  <AlertCircle className="h-4.5 w-4.5" />
                  <span>{formError}</span>
                </div>
              )}

              <InputField
                label="Coupon Promo Code"
                placeholder="e.g. MONSOON20"
                error={errors.code?.message}
                disabled={modalLoading || !!formSuccess}
                {...register("code")}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Discount Value"
                  type="number"
                  placeholder="10"
                  error={errors.discount?.message}
                  disabled={modalLoading || !!formSuccess}
                  {...register("discount")}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Discount Type
                  </label>
                  <select
                    className="w-full h-11 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 focus:border-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    disabled={modalLoading || !!formSuccess}
                    {...register("type")}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat INR Amount (₹)</option>
                  </select>
                </div>
              </div>

              <InputField
                label="Minimum purchase value (Optional)"
                type="number"
                placeholder="999"
                error={errors.minSpend?.message}
                disabled={modalLoading || !!formSuccess}
                {...register("minSpend")}
              />

              {/* Submit Buttons */}
              <div className="mt-6 flex justify-end gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={modalLoading || !!formSuccess}
                  className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  isLoading={modalLoading || !!formSuccess}
                  loadingText="Creating..."
                  className="px-4 py-2 text-xs"
                >
                  Publish Coupon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
