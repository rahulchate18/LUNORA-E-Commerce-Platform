/**
 * app/admin/products/new/page.tsx — Create Product form
 *
 * Client Component for validated inventory additions.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdmin } from "@/context/admin-context";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ALL_CATEGORIES, CATEGORY_LABELS, type ProductImage } from "@/types";
import { ImageUploader } from "@/components/admin/image-uploader";

// Validation schema
const productFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  shortDescription: z.string().min(5, "Short description must be at least 5 characters"),
  description: z.string().min(10, "Full description must be at least 10 characters"),
  category: z.enum(["tote-bags", "handbags", "sling-bags", "laptop-bags", "travel-bags", "accessories"], {
    message: "Please select a valid category",
  }),
  price: z.coerce.number().min(1, "Price must be at least ₹1"),
  originalPrice: z.coerce.number().optional(),
  sku: z.string().min(3, "SKU must be at least 3 characters").toUpperCase(),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  tags: z.string().optional(), // Comma-separated
  images: z.array(z.any()).min(1, "Provide at least one product image"),
});

type ProductFormFields = z.infer<typeof productFormSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const { addProduct } = useAdmin();

  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      sku: "LUN-BAG-",
      price: "" as any,
      stock: 10 as any,
      material: "",
      dimensions: "",
      tags: "",
      images: [] as ProductImage[],
    },
  });

  const onSubmit = async (data: any) => {
    const formData = data as ProductFormFields;
    setLoading(true);
    setFormError(null);
    setFormSuccess(null);

    // Process lists
    const parsedTags = formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    
    // Static mock colors for creation simplicity
    const mockColors = [
      { name: "Charcoal Black", hex: "#1A1A1A" },
      { name: "Saddle Brown", hex: "#8B4513" },
      { name: "Champagne Gold", hex: "#D4A373" },
    ];

    try {
      const res = await addProduct({
        name: data.name,
        shortDescription: data.shortDescription,
        description: data.description,
        category: data.category,
        price: data.price,
        originalPrice: data.originalPrice,
        sku: data.sku,
        stock: data.stock,
        material: data.material,
        dimensions: data.dimensions,
        tags: parsedTags,
        images: formData.images,
        colors: mockColors,
        isFeatured: false,
        isNew: true,
        isBestseller: false,
      });

      if (res.success) {
        setFormSuccess(res.message);
        reset();
        setTimeout(() => {
          router.push("/admin/products");
        }, 1200);
      } else {
        setFormError(res.message);
      }
    } catch {
      setFormError("An unexpected error occurred while adding the product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
        <Link
          href="/admin/products"
          className="flex items-center gap-1 hover:text-neutral-950 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Inventory</span>
        </Link>
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Add New Product
        </h2>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          Create a new catalog item for LUNORA women's bags.
        </p>
      </div>

      {/* Form panel */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {formSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
              <CheckCircle2 className="h-4.5 w-4.5" />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-800 dark:bg-red-950/20 dark:text-red-400">
              <AlertCircle className="h-4.5 w-4.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Name & SKU */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Product Name"
              placeholder="Classic Canvas Tote"
              error={errors.name?.message}
              disabled={loading || !!formSuccess}
              {...register("name")}
            />
            <InputField
              label="SKU Code"
              placeholder="LUN-TOT-001"
              error={errors.sku?.message}
              disabled={loading || !!formSuccess}
              {...register("sku")}
            />
          </div>

          {/* Short Description */}
          <InputField
            label="Short Summary description"
            placeholder="A brief headline highlight describing leather grain or storage capacity..."
            error={errors.shortDescription?.message}
            disabled={loading || !!formSuccess}
            {...register("shortDescription")}
          />

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Full Product Story Description
            </label>
            <textarea
              rows={4}
              placeholder="Provide a detailed overview of manufacturing details, dimensions layouts, material stitching, and daily usage styles..."
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 placeholder-neutral-400 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
              disabled={loading || !!formSuccess}
              {...register("description")}
            />
            {errors.description?.message && (
              <p className="text-[11px] font-medium text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Price & originalPrice & Stock */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <InputField
              label="Selling Price (INR)"
              type="number"
              placeholder="1299"
              error={errors.price?.message}
              disabled={loading || !!formSuccess}
              {...register("price")}
            />
            <InputField
              label="Original Price (Before Discount)"
              type="number"
              placeholder="1599"
              error={errors.originalPrice?.message}
              disabled={loading || !!formSuccess}
              {...register("originalPrice")}
            />
            <InputField
              label="Initial Inventory Stock Units"
              type="number"
              placeholder="10"
              error={errors.stock?.message}
              disabled={loading || !!formSuccess}
              {...register("stock")}
            />
          </div>

          {/* Category, Material, Dimensions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Collection Category
              </label>
              <select
                className="w-full h-11 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 focus:border-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                disabled={loading || !!formSuccess}
                {...register("category")}
              >
                <option value="">Select Category</option>
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
              {errors.category?.message && (
                <p className="text-[11px] font-medium text-red-600">{errors.category.message}</p>
              )}
            </div>

            <InputField
              label="Material details"
              placeholder="16oz Canvas, Suede leather trim"
              error={errors.material?.message}
              disabled={loading || !!formSuccess}
              {...register("material")}
            />

            <InputField
              label="Dimensions specs"
              placeholder="40cm x 35cm x 12cm"
              error={errors.dimensions?.message}
              disabled={loading || !!formSuccess}
              {...register("dimensions")}
            />
          </div>

          {/* Image Uploader */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Product Images
            </label>
            <ImageUploader
              images={watch("images") || []}
              onChange={(updatedImages) => setValue("images", updatedImages, { shouldValidate: true })}
              disabled={loading || !!formSuccess}
            />
            {errors.images?.message && (
              <p className="text-[11px] font-medium text-red-600">{(errors.images.message as string)}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <InputField
              label="Keywords Tags (Comma separated)"
              placeholder="tote, canvas, office, green"
              error={errors.tags?.message}
              disabled={loading || !!formSuccess}
              {...register("tags")}
            />
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 border-t border-neutral-100 pt-6 dark:border-neutral-800">
            <Link
              href="/admin/products"
              className="rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              isLoading={loading || !!formSuccess}
              loadingText="Creating listing..."
              className="px-6 py-2.5 text-xs"
            >
              Publish Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
