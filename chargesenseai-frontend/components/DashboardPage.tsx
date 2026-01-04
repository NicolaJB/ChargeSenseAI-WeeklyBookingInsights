"use client";

import { useState } from "react";
import UploadForm from "./UploadForm";
import Dashboard from "./Dashboard";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>({
    customerSegments: [],
    weeklyCharges: [],
    busUsage: [],
    marketingAnalytics: null,
    week_start: null,
  });
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:51115/upload-weekly", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      // --- Only show alert if absolutely no data returned ---
      const hasData =
        (data.customerSegments && data.customerSegments.length > 0) ||
        (data.weeklyCharges && data.weeklyCharges.length > 0) ||
        (data.busUsage && data.busUsage.length > 0) ||
        (data.marketingAnalytics && data.marketingAnalytics.weeks_data?.length > 0);

      if (!hasData) {
        alert("Upload successful, but no analytics returned.");
      }

      // Update dashboard state
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <UploadForm label="Upload Weekly Bookings or Marketing File" onFileSelected={handleFileUpload} />

      <Dashboard
        customerSegments={dashboardData.customerSegments}
        weeklyCharges={dashboardData.weeklyCharges}
        busUsage={dashboardData.busUsage}
        marketingAnalytics={dashboardData.marketingAnalytics}
        loading={loading}
      />
    </div>
  );
}
