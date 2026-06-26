/**
 * components/shop/sort-select.tsx — Product sorting select dropdown
 *
 * Client Component that writes "sort" to the URL.
 */
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SortOption, SORT_LABELS } from "@/types";

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const activeSort = (searchParams.get("sort") as SortOption) ?? "featured";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort-select"
        className="hidden text-xs font-medium text-neutral-500 sm:inline-block dark:text-neutral-400"
      >
        Sort by:
      </label>
      <select
        id="sort-select"
        value={activeSort}
        onChange={handleChange}
        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-800 shadow-2xs outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-white"
      >
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
