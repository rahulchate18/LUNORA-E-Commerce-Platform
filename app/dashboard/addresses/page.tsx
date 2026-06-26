/**
 * app/dashboard/addresses/page.tsx — Saved Shipping Addresses Page
 *
 * Client Component that consumes AuthContext. Handles listing, deleting,
 * setting default, and spawning modal editors for shipping addresses.
 */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/auth-context";
import type { Address } from "@/types";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Trash2, Edit2, Check, X, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Address validation schema
const addressSchema = z.object({
  name: z.string().min(2, "Recipient name must be at least 2 characters"),
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postalCode: z.string().regex(/^\d{6}$/, "Postal code must be exactly 6 digits"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  isDefault: z.boolean(),
});

type AddressFields = z.infer<typeof addressSchema>;

export default function AddressesPage() {
  const {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuth();

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Lists loader tracking
  const [actionsLoading, setActionsLoading] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AddressFields>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
      isDefault: false,
    },
  });

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    reset({
      name: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
      isDefault: false,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: Address) => {
    setEditingAddress(addr);
    reset({
      name: addr.name,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      phone: addr.phone,
      isDefault: addr.isDefault,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    setFormError(null);
  };

  const onSubmit = async (data: AddressFields) => {
    setModalLoading(true);
    setFormError(null);
    try {
      let res;
      if (editingAddress) {
        res = await updateAddress({ ...data, id: editingAddress.id });
      } else {
        res = await addAddress(data);
      }

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
      setFormError("Failed to save address details.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionsLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await deleteAddress(id);
    } finally {
      setActionsLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSetDefault = async (id: string) => {
    setActionsLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await setDefaultAddress(id);
    } finally {
      setActionsLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Shipping Addresses</h2>
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            Manage your saved delivery destinations for faster checking out.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          <Plus className="h-4 w-4" />
          <span>Add New</span>
        </button>
      </div>

      {/* Grid List */}
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 py-16 text-center dark:border-neutral-800">
          <MapPin className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
          <h3 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white">
            No Addresses Saved
          </h3>
          <p className="mt-2 text-xs text-neutral-500 max-w-xs dark:text-neutral-400">
            Save delivery addresses to speed up your checkout flow when buying luxury accessories.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-6 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => {
            const isLoading = actionsLoading[addr.id];
            return (
              <div
                key={addr.id}
                className={cn(
                  "relative flex flex-col rounded-xl border p-5 bg-white shadow-2xs dark:bg-neutral-900",
                  addr.isDefault
                    ? "border-neutral-950 ring-1 ring-neutral-950 dark:border-white dark:ring-white"
                    : "border-neutral-100 dark:border-neutral-800"
                )}
              >
                {/* Header indicators */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold text-neutral-950 text-sm dark:text-white">{addr.name}</span>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-900 uppercase dark:text-white">
                      <ShieldCheck className="h-3.5 w-3.5 fill-neutral-900/10" />
                      Default
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs text-neutral-600 leading-relaxed dark:text-neutral-400">
                  <p>{addr.street}</p>
                  <p>
                    {addr.city}, {addr.state} — {addr.postalCode}
                  </p>
                  <p>Phone: {addr.phone}</p>
                </div>

                {/* Buttons block */}
                <div className="mt-6 flex items-center gap-4 border-t border-neutral-50 pt-4 dark:border-neutral-800">
                  <button
                    onClick={() => handleOpenEditModal(addr)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={isLoading || addr.isDefault}
                    className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-red-600 disabled:opacity-30 disabled:hover:text-neutral-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      disabled={isLoading}
                      className="ml-auto text-xs font-semibold text-neutral-900 underline hover:no-underline dark:text-white"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Popup Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={handleCloseModal}
          />

          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-950 animate-scale-in">
            {/* Close */}
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {editingAddress ? "Edit Shipping Address" : "Add Shipping Address"}
            </h3>
            <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
              Enter the recipient's delivery details.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              {formSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
                  <Check className="h-4.5 w-4.5" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-800 dark:bg-red-950/20 dark:text-red-400">
                  <X className="h-4 w-4" />
                  <span>{formError}</span>
                </div>
              )}

              <InputField
                label="Recipient's Full Name"
                placeholder="e.g. Aarushi Goel"
                error={errors.name?.message}
                disabled={modalLoading || !!formSuccess}
                {...register("name")}
              />

              <InputField
                label="Street Address"
                placeholder="e.g. Flat 402, Block C, Maple Heights"
                error={errors.street?.message}
                disabled={modalLoading || !!formSuccess}
                {...register("street")}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="City"
                  placeholder="Bengaluru"
                  error={errors.city?.message}
                  disabled={modalLoading || !!formSuccess}
                  {...register("city")}
                />
                <InputField
                  label="State"
                  placeholder="Karnataka"
                  error={errors.state?.message}
                  disabled={modalLoading || !!formSuccess}
                  {...register("state")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Postal Code (6 digits)"
                  placeholder="560103"
                  error={errors.postalCode?.message}
                  disabled={modalLoading || !!formSuccess}
                  {...register("postalCode")}
                />
                <InputField
                  label="Phone Number"
                  placeholder="9876543210"
                  error={errors.phone?.message}
                  disabled={modalLoading || !!formSuccess}
                  {...register("phone")}
                />
              </div>

              {/* Default checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="addr-default"
                  disabled={modalLoading || !!formSuccess || (editingAddress?.isDefault)}
                  className="h-4 w-4 rounded-sm border-neutral-300 text-neutral-900 focus:ring-neutral-950 dark:border-neutral-800 dark:text-white"
                  {...register("isDefault")}
                />
                <label
                  htmlFor="addr-default"
                  className="text-xs font-semibold text-neutral-600 dark:text-neutral-400"
                >
                  Set as default shipping address
                </label>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={modalLoading || !!formSuccess}
                  className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  isLoading={modalLoading || !!formSuccess}
                  loadingText="Saving..."
                  className="px-4 py-2 text-xs"
                >
                  Save Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
