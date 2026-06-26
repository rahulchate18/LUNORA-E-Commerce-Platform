/**
 * app/admin/customers/page.tsx — Admin Customer Management logs
 *
 * Client Component that consumes AdminContext.
 */
"use client";

import { useState } from "react";
import { useAdmin, type Customer } from "@/context/admin-context";
import { formatPrice } from "@/lib/mock-data";
import { Search, Eye, AlertCircle, CheckCircle2, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminCustomersPage() {
  const { customers, toggleCustomerBlock } = useAdmin();

  // Search filter
  const [query, setQuery] = useState("");

  // Customer Profile view popup states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Actions loading tracking
  const [actionsLoading, setActionsLoading] = useState<Record<string, boolean>>({});

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
  );

  const handleToggleBlock = async (c: Customer) => {
    setActionsLoading((prev) => ({ ...prev, [c.id]: true }));
    try {
      await toggleCustomerBlock(c.id);
      // Sync selected profile state if open
      if (selectedCustomer && selectedCustomer.id === c.id) {
        setSelectedCustomer((prev) =>
          prev
            ? {
                ...prev,
                status: prev.status === "Active" ? "Blocked" : "Active",
              }
            : null
        );
      }
    } finally {
      setActionsLoading((prev) => ({ ...prev, [c.id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Customer Database</h2>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          View registered customer accounts, total spend metrics, and manage security blocks.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:max-w-xs">
        <input
          type="text"
          placeholder="Search by customer name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pr-3 pl-8 text-xs text-neutral-950 placeholder-neutral-400 outline-hidden focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
        />
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
      </div>

      {/* Customers List Table */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/50">
                <th className="py-3 px-6 font-semibold uppercase tracking-wider">Customer</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Orders</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Total Spent</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Joined Date</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
              {filteredCustomers.map((c) => {
                const isLoading = actionsLoading[c.id];
                return (
                  <tr key={c.id} className="text-neutral-700 dark:text-neutral-300">
                    {/* Customer Info */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">{c.name}</p>
                          <p className="text-[10px] text-neutral-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold leading-none capitalize",
                          c.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                            : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                        )}
                      >
                        {c.status}
                      </span>
                    </td>
                    {/* Orders count */}
                    <td className="py-3.5 px-4 font-semibold">{c.ordersCount} orders</td>
                    {/* Total spent */}
                    <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                      {formatPrice(c.totalSpent)}
                    </td>
                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-neutral-400" suppressHydrationWarning>
                      {new Date(c.joinedDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                      })}
                    </td>
                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right space-x-2.5">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1 font-semibold text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => handleToggleBlock(c)}
                        disabled={isLoading}
                        className={cn(
                          "inline-flex items-center gap-1 font-semibold transition-colors duration-150",
                          c.status === "Active"
                            ? "text-red-500 hover:text-red-700"
                            : "text-emerald-600 hover:text-emerald-800"
                        )}
                      >
                        {c.status === "Active" ? "Block" : "Unblock"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer profile modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedCustomer(null)} />
          
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900 animate-scale-in">
            {/* Close */}
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-50 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Customer Card</h3>
            <div className="mt-6 flex flex-col items-center text-center border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-150 text-xl font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                {selectedCustomer.name.slice(0, 2).toUpperCase()}
              </div>
              <h4 className="mt-3 text-sm font-bold text-neutral-900 dark:text-white">
                {selectedCustomer.name}
              </h4>
              <p className="text-xs text-neutral-400">{selectedCustomer.email}</p>
              {selectedCustomer.phone && <p className="text-xs text-neutral-400">{selectedCustomer.phone}</p>}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800 text-xs">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Total Orders</span>
                <p className="mt-1 font-bold text-neutral-850 dark:text-white">{selectedCustomer.ordersCount} transactions</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Total Spend Value</span>
                <p className="mt-1 font-bold text-neutral-850 dark:text-white">{formatPrice(selectedCustomer.totalSpent)}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Account status</span>
                <div className="flex items-center gap-1.5 mt-1 font-bold">
                  {selectedCustomer.status === "Active" ? (
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
                  )}
                  <span className="text-neutral-850 capitalize dark:text-white">{selectedCustomer.status}</span>
                </div>
              </div>

              <Button
                onClick={() => handleToggleBlock(selectedCustomer)}
                className={cn(
                  "px-4 py-1.5 text-xs h-9",
                  selectedCustomer.status === "Active" ? "bg-red-600 hover:bg-red-700 border-red-600 text-white" : ""
                )}
              >
                {selectedCustomer.status === "Active" ? "Block Account" : "Unblock Account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
