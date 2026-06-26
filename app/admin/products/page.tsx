/**
 * app/admin/products/page.tsx — Admin Product Inventory Catalog
 *
 * Client Component that consumes AdminContext.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdmin } from "@/context/admin-context";
import { formatPrice } from "@/lib/mock-data";
import { Search, Plus, Trash2, Edit2, Inbox, AlertTriangle, X } from "lucide-react";
import { CATEGORY_LABELS, ALL_CATEGORIES, type Product, type Category } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const { products, deleteProduct } = useAdmin();

  // Search & filter states
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Deletion modal states
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);

  // Filter products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteTrigger = (p: Product) => {
    setToDelete(p);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setDeleteLoading(true);
    try {
      const res = await deleteProduct(toDelete.id);
      if (res.success) {
        setDeleteFeedback(res.message);
        setTimeout(() => {
          setDeleteFeedback(null);
          setToDelete(null);
        }, 800);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Store Inventory</h2>
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            Browse, search, edit, and delete LUNORA products.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Search & filters controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pr-3 pl-8 text-xs text-neutral-950 placeholder-neutral-400 outline-hidden focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
          />
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        </div>

        {/* Category switcher */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 outline-hidden focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-white"
        >
          <option value="all">All Categories</option>
          {ALL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {/* Product Listings Table */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 py-16 text-center dark:border-neutral-800">
          <Inbox className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
          <h3 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white">
            No Products Found
          </h3>
          <p className="mt-2 text-xs text-neutral-500 max-w-xs dark:text-neutral-400">
            No items in inventory match your current filters. Try resetting search or category fields.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/50">
                  <th className="py-3 px-6 font-semibold uppercase tracking-wider">Item</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">SKU</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Category</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Price</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Stock</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="text-neutral-700 dark:text-neutral-300">
                    {/* Item */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-10 overflow-hidden rounded-md border border-neutral-100 bg-neutral-50 dark:border-neutral-800">
                          {p.images && p.images.length > 0 ? (
                            <Image
                              src={typeof p.images[0] === "string" ? p.images[0] : (p.images[0]?.url || "")}
                              alt={p.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-[8px] text-neutral-300">No Img</span>
                          )}
                        </div>
                        <span className="font-semibold text-neutral-900 dark:text-white">{p.name}</span>
                      </div>
                    </td>
                    {/* SKU */}
                    <td className="py-3.5 px-4 font-mono text-[10px] text-neutral-400">
                      {p.sku}
                    </td>
                    {/* Category */}
                    <td className="py-3.5 px-4 capitalize">
                      {p.category.replace("-", " ")}
                    </td>
                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                      {formatPrice(p.price)}
                    </td>
                    {/* Stock */}
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          "font-semibold",
                          p.stock === 0
                            ? "text-red-600"
                            : p.stock <= 5
                            ? "text-amber-600"
                            : "text-neutral-600 dark:text-neutral-300"
                        )}
                      >
                        {p.stock === 0 ? "Out of Stock" : `${p.stock} units`}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right space-x-2.5">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="inline-flex items-center gap-1 font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteTrigger(p)}
                        className="inline-flex items-center gap-1 font-semibold text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => !deleteLoading && setToDelete(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900 animate-scale-in">
            {/* Close */}
            {!deleteLoading && (
              <button
                onClick={() => setToDelete(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-50 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-white">
              Delete Product?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Are you sure you want to delete <span className="font-semibold text-neutral-800 dark:text-neutral-200">{toDelete.name}</span>? This action is permanent and will remove the item from storefront catalogs immediately.
            </p>

            {deleteFeedback ? (
              <p className="mt-4 text-xs font-bold text-emerald-600">{deleteFeedback}</p>
            ) : (
              <div className="mt-6 flex justify-end gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => setToDelete(null)}
                  className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleConfirmDelete}
                  isLoading={deleteLoading}
                  loadingText="Deleting..."
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600 px-4 py-2 text-xs"
                >
                  Delete Product
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
