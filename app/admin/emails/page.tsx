"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/context/toast-context";
import {
  Mail,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Inbox,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE } from "@/lib/api-config";

interface EmailLog {
  _id: string;
  recipient: string;
  subject: string;
  template: string;
  status: "sent" | "failed" | "pending";
  provider: string;
  attempts: number;
  error?: string;
  variables?: Record<string, any>;
  createdAt: string;
  sentAt?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function AdminEmailsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryLoading, setRetryLoading] = useState<Record<string, boolean>>({});
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [template, setTemplate] = useState("");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("lunora_token");
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(template ? { template } : {}),
      });

      const res = await fetch(`${API_BASE}/admin/emails/logs?${queryParams}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (data.success) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
      } else {
        toast.error(data.message || "Failed to load email logs.");
      }
    } catch (err) {
      toast.error("Could not establish connection to the admin mail server.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, template, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRetry = async (logId: string) => {
    setRetryLoading((prev) => ({ ...prev, [logId]: true }));
    try {
      const token = localStorage.getItem("lunora_token");
      const res = await fetch(`${API_BASE}/admin/emails/logs/${logId}/retry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Email resent successfully!");
        fetchLogs();
      } else {
        toast.error(data.message || "Manual email dispatch failed.");
      }
    } catch (err) {
      toast.error("Failed to execute manual email dispatch.");
    } finally {
      setRetryLoading((prev) => ({ ...prev, [logId]: false }));
    }
  };

  const toggleExpandLog = (logId: string) => {
    setExpandedLogId((prev) => (prev === logId ? null : logId));
  };

  const templatesList = [
    { value: "welcome", label: "Welcome" },
    { value: "forgot-password", label: "Forgot Password" },
    { value: "password-reset-success", label: "Reset Success" },
    { value: "order-confirmation", label: "Order Confirmation" },
    { value: "order-cancelled", label: "Order Cancelled" },
    { value: "shipping-update", label: "Shipping Update" },
    { value: "delivery", label: "Delivery" },
    { value: "contact", label: "Contact Form" },
    { value: "admin-new-order", label: "Admin Copy" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white font-serif tracking-wide">Email Dispatch Logs</h2>
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            Monitor, inspect variables, and manually retry system notifications.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Controls / Filter bar */}
      <div className="grid gap-3 sm:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search email or subject..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pr-3 pl-8 text-xs text-neutral-950 placeholder-neutral-400 outline-hidden focus:border-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-white transition-colors"
          />
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 outline-hidden focus:border-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-white transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>

        {/* Template */}
        <select
          value={template}
          onChange={(e) => {
            setTemplate(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 outline-hidden focus:border-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-white transition-colors"
        >
          <option value="">All Templates</option>
          {templatesList.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Reset filters button */}
        {(search || status || template) && (
          <button
            onClick={() => {
              setSearch("");
              setStatus("");
              setTemplate("");
              setPage(1);
            }}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-950 dark:hover:text-white transition-colors"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/50">
                <th className="py-3 px-4 font-semibold uppercase tracking-wider w-8"></th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Recipient</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Subject</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Template</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Attempts</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-400">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin mb-2" />
                    <span>Loading logs...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-400">
                    <Inbox className="mx-auto h-8 w-8 mb-2 stroke-1" />
                    <span>No matching email logs found.</span>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log._id;
                  const isRetrying = retryLoading[log._id];

                  return (
                    <React.Fragment key={log._id}>
                      <tr
                        className={cn(
                          "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors",
                          isExpanded && "bg-neutral-50/20 dark:bg-neutral-900/30"
                        )}
                        onClick={() => toggleExpandLog(log._id)}
                      >
                        <td className="py-3.5 px-4 text-center">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-neutral-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-neutral-400" />
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-neutral-900 dark:text-white">
                          {log.recipient}
                        </td>
                        <td className="py-3.5 px-4 font-medium max-w-[200px] truncate">
                          {log.subject}
                        </td>
                        <td className="py-3.5 px-4 font-mono uppercase text-[10px] text-neutral-500 dark:text-neutral-400">
                          {log.template}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-500">
                          {log.attempts}/3
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold leading-none uppercase",
                              log.status === "sent"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                                : log.status === "failed"
                                ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                            )}
                          >
                            {log.status === "sent" && <CheckCircle2 className="h-2.5 w-2.5" />}
                            {log.status === "failed" && <AlertCircle className="h-2.5 w-2.5" />}
                            {log.status === "pending" && <Clock className="h-2.5 w-2.5 animate-pulse" />}
                            <span>{log.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-400">
                          {new Date(log.createdAt).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleRetry(log._id)}
                            disabled={isRetrying}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-all border shadow-3xs",
                              log.status === "failed"
                                ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/10 dark:text-red-400"
                                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-850"
                            )}
                          >
                            <RefreshCw className={cn("h-3 w-3", isRetrying && "animate-spin")} />
                            <span>Retry</span>
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-neutral-50/10 dark:bg-neutral-900/10">
                          <td colSpan={8} className="py-4 px-6 border-t border-neutral-100 dark:border-neutral-800">
                            <div className="space-y-3">
                              {log.error && (
                                <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-red-800 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
                                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    <span>Error Trace</span>
                                  </h4>
                                  <p className="font-mono text-[10px] break-all leading-normal whitespace-pre-wrap">
                                    {log.error}
                                  </p>
                                </div>
                              )}
                              <div>
                                <h4 className="text-[11px] font-bold text-neutral-950 dark:text-white uppercase tracking-wider mb-1">
                                  Template Variables JSON
                                </h4>
                                <pre className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 p-3 font-mono text-[10px] text-neutral-850 dark:text-neutral-300 overflow-x-auto leading-normal">
                                  {JSON.stringify(log.variables || {}, null, 2)}
                                </pre>
                              </div>
                              <div className="flex gap-6 text-[10px] text-neutral-400">
                                <span>
                                  <strong>Email Log ID:</strong> {log._id}
                                </span>
                                <span>
                                  <strong>SMTP Provider:</strong> {log.provider}
                                </span>
                                {log.sentAt && (
                                  <span>
                                    <strong>Sent At:</strong> {new Date(log.sentAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 py-3 px-6 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <span>
              Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} logs
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={pagination.page === 1}
                className="rounded-md border border-neutral-200 bg-white px-3 py-1 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
                disabled={pagination.page === pagination.pages}
                className="rounded-md border border-neutral-200 bg-white px-3 py-1 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
