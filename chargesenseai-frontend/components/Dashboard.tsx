"use client";

import React from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface CustomerSegment {
  segment: string;
  bookingCount: number;
  totalCharge: number;
  predicted?: number;
}

interface WeeklyCharge {
  day: string;
  actual: number;
  predicted?: number;
}

interface BusUsage {
  busService: string;
  usage: number;
}

interface MarketingAnalytics {
  weeks_data?: any[];
  channel_roas?: { search: number; social: number; email: number };
  total_revenue_forecast?: number;
}

interface DashboardProps {
  customerSegments: CustomerSegment[];
  weeklyCharges: WeeklyCharge[];
  busUsage: BusUsage[];
  marketingAnalytics?: MarketingAnalytics | null;
  loading?: boolean;
}

const formatCurrency = (value: number | undefined) =>
  `£${(Number(value) || 0).toFixed(2)}`;

export default function Dashboard({
  customerSegments,
  weeklyCharges,
  busUsage,
  marketingAnalytics,
  loading = false,
}: DashboardProps) {
  if (loading) {
    return (
      <div className="text-center text-gray-700 mt-6 font-medium">
        Processing data…
      </div>
    );
  }

  const hasWeeklyData =
    customerSegments.length > 0 || weeklyCharges.length > 0 || busUsage.length > 0;
  const hasMarketingData = !!marketingAnalytics;

  if (!hasWeeklyData && !hasMarketingData) {
    return (
      <div className="text-center text-gray-700 mt-10 font-medium">
        Upload your weekly bookings file and click 'Run App'. Upload your most recent weekly marketing file afterward to generate insights.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* ---------- Top Charts ---------- */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Dashboard Overview</h2>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Weekly Charges Chart */}
          {weeklyCharges.length > 0 && (
            <div className="flex-1 h-64 md:h-96">
              <Bar
                data={{
                  labels: weeklyCharges.map((w) => w.day),
                  datasets: [
                    {
                      label: "Actual",
                      data: weeklyCharges.map((w) => Number(w.actual) || 0),
                      backgroundColor: "rgba(59, 130, 246, 0.6)",
                    },
                    {
                      label: "Predicted",
                      data: weeklyCharges.map((w) => Number(w.predicted) || 0),
                      backgroundColor: "rgba(16, 185, 129, 0.6)",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top" },
                    title: { display: true, text: "Weekly Charges (£)" },
                  },
                }}
              />
            </div>
          )}

          {/* Marketing Impact Chart */}
          {hasMarketingData && marketingAnalytics?.weeks_data?.length > 0 && (
            <div className="flex-1 h-64 md:h-96">
              <Line
                data={{
                  labels: marketingAnalytics.weeks_data.map((_, i) => `Week ${i + 1}`),
                  datasets: [
                    {
                      type: "bar",
                      label: "Weekly Spend",
                      data: marketingAnalytics.weeks_data.map(
                        (w) =>
                          Number(w.search_spend || 0) +
                          Number(w.social_spend || 0) +
                          Number(w.email_spend || 0)
                      ),
                      backgroundColor: "rgba(245, 158, 11, 0.6)",
                    },
                    {
                      type: "line",
                      label: "Predicted Revenue",
                      data: marketingAnalytics.weeks_data.map((w) => Number(w.revenue || 0)),
                      borderColor: "rgba(16, 185, 129, 1)",
                      backgroundColor: "rgba(16, 185, 129, 0.2)",
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top" },
                    title: {
                      display: true,
                      text: "Marketing Weekly Impact (Revenue vs Spend)",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "£" },
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* ---------- Weekly Charges Table ---------- */}
      {weeklyCharges.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-gray-900 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Day</th>
                <th className="border px-3 py-2 text-right">Actual (£)</th>
                <th className="border px-3 py-2 text-right">Predicted (£)</th>
              </tr>
            </thead>
            <tbody>
              {weeklyCharges.map((w) => (
                <tr key={w.day}>
                  <td className="border px-3 py-1">{w.day}</td>
                  <td className="border px-3 py-1 text-right">{formatCurrency(w.actual)}</td>
                  <td className="border px-3 py-1 text-right">{formatCurrency(w.predicted)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- Customer Segments ---------- */}
      {customerSegments.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Top Students</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-gray-900 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">Student</th>
                  <th className="border px-3 py-2 text-right">Bookings</th>
                  <th className="border px-3 py-2 text-right">Actual (£)</th>
                  <th className="border px-3 py-2 text-right">Predicted (£)</th>
                </tr>
              </thead>
              <tbody>
                {customerSegments.slice(0, 10).map((c, i) => (
                  <tr key={i}>
                    <td className="border px-3 py-1">{c.segment}</td>
                    <td className="border px-3 py-1 text-right">{Number(c.bookingCount) || 0}</td>
                    <td className="border px-3 py-1 text-right">{formatCurrency(c.totalCharge)}</td>
                    <td className="border px-3 py-1 text-right">{formatCurrency(c.predicted)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ---------- Bus Usage (Chart + Table Side-by-Side) ---------- */}
      {busUsage.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Bus Usage</h2>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Bus Usage Chart */}
            <div className="flex-1 h-64 md:h-96">
              <Bar
                data={{
                  labels: busUsage.map((b) => b.busService),
                  datasets: [
                    {
                      label: "Usage",
                      data: busUsage.map((b) => Number(b.usage) || 0),
                      backgroundColor: "rgba(245, 158, 11, 0.6)",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top" },
                    title: { display: true, text: "Bus Usage" },
                  },
                }}
              />
            </div>

            {/* Bus Service Table */}
            <div className="flex-1 max-h-96 overflow-y-auto border rounded p-2">
              <table className="min-w-full text-gray-900 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 text-left">Service</th>
                    <th className="px-2 py-1 text-right">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {busUsage.map((b) => (
                    <tr key={b.busService}>
                      <td className="px-2 py-1">{b.busService}</td>
                      <td className="px-2 py-1 text-right">{Number(b.usage) || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Marketing Analytics Summary ---------- */}
      {hasMarketingData && (
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Marketing Impact Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="border rounded p-3 text-gray-900">
              <div className="text-gray-500">Campaigns</div>
              <div className="font-semibold">{marketingAnalytics?.weeks_data?.length ?? 0}</div>
            </div>
            <div className="border rounded p-3 text-gray-900">
              <div className="text-gray-500">Total Spend</div>
              <div className="font-semibold">
                £
                {(
                  marketingAnalytics?.weeks_data?.reduce(
                    (sum, w) =>
                      sum +
                      (Number(w.search_spend || 0) +
                        Number(w.social_spend || 0) +
                        Number(w.email_spend || 0)),
                  0
                ) ?? 0).toFixed(2)}
              </div>
            </div>
            <div className="border rounded p-3 text-gray-900">
              <div className="text-gray-500">Predicted Revenue</div>
              <div className="font-semibold">
                £
                {(
                  marketingAnalytics?.weeks_data?.reduce(
                    (sum, w) => sum + (Number(w.revenue || 0) || 0),
                  0
                ) ?? 0).toFixed(2)}
              </div>
            </div>
            <div className="border rounded p-3 text-gray-900">
              <div className="text-gray-500">ROAS (Search)</div>
              <div className="font-semibold">
                {(marketingAnalytics?.channel_roas?.search || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
