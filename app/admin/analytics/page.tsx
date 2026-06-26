/**
 * app/admin/analytics/page.tsx — Analytics Dashboard (Server Component)
 */
import { ChartLine } from "@/components/admin/chart-line";
import { ChartBar } from "@/components/admin/chart-bar";
import { ChartDonut } from "@/components/admin/chart-donut";
import { DollarSign, Percent, TrendingUp, TrendingDown } from "lucide-react";

export const metadata = {
  title: "Analytics Report",
  description: "View store transactions, sales volume trends, and product categories share.",
};

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Analytics Report
        </h1>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          Store performance metrics and sales analysis.
        </p>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Average Order Value (AOV)
          </span>
          <h3 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">₹2,349</h3>
          <p className="mt-1 text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" />
            +8.2% from last month
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Store Conversion Rate
          </span>
          <h3 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">3.12%</h3>
          <p className="mt-1 text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" />
            +1.5% from last month
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Return Rate
          </span>
          <h3 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">1.84%</h3>
          <p className="mt-1 text-[10px] text-red-600 font-semibold flex items-center gap-0.5">
            <TrendingDown className="h-3 w-3" />
            -0.4% from last month
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales volume Line Chart */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-6 text-sm font-bold text-neutral-900 dark:text-white">
            Monthly Order Volumes (Sales)
          </h3>
          <ChartLine />
        </div>

        {/* Revenue Bar Chart */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-6 text-sm font-bold text-neutral-900 dark:text-white">
            Monthly Store Revenues (INR in Thousands)
          </h3>
          <ChartBar />
        </div>
      </div>

      {/* Category share Donut Chart */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 max-w-2xl">
        <h3 className="mb-6 text-sm font-bold text-neutral-900 dark:text-white">
          Inventory Category Distribution Share
        </h3>
        <ChartDonut />
      </div>
    </div>
  );
}
