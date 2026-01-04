"use client";

import { useState } from "react";
import UploadForm from "../components/UploadForm";
import Dashboard from "../components/Dashboard";
import Toast from "../components/Toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HomePage() {
  const [customerSegments, setCustomerSegments] = useState<any[]>([]);
  const [weeklyCharges, setWeeklyCharges] = useState<any[]>([]);
  const [busUsage, setBusUsage] = useState<any[]>([]);
  const [marketingAnalytics, setMarketingAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const [bookingsFile, setBookingsFile] = useState<File | null>(null);
  const [marketingFile, setMarketingFile] = useState<File | null>(null);

  const [toastMessage, setToastMessage] = useState<string>("");

  // ---------------- Helpers ---------------- //
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const normalizeBusUsage = (bus: any[]) => {
    const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const SESSIONS = ["AM", "Explorers 1", "Explorers 2", "Explorers 3"];
    const normalizedBus: { busService: string; usage: number }[] = [];

    DAYS.forEach((day) => {
      SESSIONS.forEach((session) => {
        const serviceName = `${day} ${session}`;
        const found = bus.find((b) => b.busService === serviceName);
        normalizedBus.push({ busService: serviceName, usage: found?.usage || 0 });
      });
    });

    return normalizedBus;
  };

  const computePredictedWeeklyCharges = (weekly: any[], segments: any[]) => {
    const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const dayMap: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4 };

    const dailyTotals = DAYS.map((day) => {
      const total = weekly.filter((w) => w.day === day).reduce((sum, w) => sum + (w.totalCharge ?? 0), 0);
      return { day, actual: total, index: dayMap[day] };
    });

    const n = dailyTotals.length;
    const sumX = dailyTotals.reduce((sum, d) => sum + d.index, 0);
    const sumY = dailyTotals.reduce((sum, d) => sum + d.actual, 0);
    const sumXY = dailyTotals.reduce((sum, d) => sum + d.index * d.actual, 0);
    const sumXX = dailyTotals.reduce((sum, d) => sum + d.index * d.index, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const weeklyWithPredicted = dailyTotals.map((d) => ({
      day: d.day,
      actual: d.actual,
      predicted: parseFloat((slope * d.index + intercept).toFixed(2)),
    }));

    const totalCharges = weekly.reduce((sum, w) => sum + (w.totalCharge ?? 0), 0);
    const totalBookings = segments.reduce((sum, s) => sum + (s.bookingCount ?? 1), 0);
    const avgChargePerBooking = totalBookings > 0 ? totalCharges / totalBookings : 0;

    const studentData = segments.map((s) => ({
      ...s,
      predicted: parseFloat((avgChargePerBooking * (s.bookingCount ?? 1)).toFixed(2)),
    }));

    return { weeklyWithPredicted, studentData };
  };

  // ---------------- Upload Handler ---------------- //
  const uploadFile = async (file: File) => {
    if (!API_URL) throw new Error("API URL not defined. Set NEXT_PUBLIC_API_URL in .env");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/upload-weekly`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Upload failed");
    }

    return res.json();
  };

  const handleRunApp = async () => {
    if (!bookingsFile) {
      showToast("Please select your Weekly Bookings file.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Upload Weekly Bookings
      const bookingsData = await uploadFile(bookingsFile);

      const normalizedBus = normalizeBusUsage(bookingsData.busUsage || []);
      const { weeklyWithPredicted, studentData } = computePredictedWeeklyCharges(
        bookingsData.weeklyCharges || [],
        bookingsData.customerSegments || []
      );

      setCustomerSegments(studentData);
      setWeeklyCharges(weeklyWithPredicted);
      setBusUsage(normalizedBus);

      // 2️⃣ Upload Marketing file if present
      if (marketingFile) {
        const marketingData = await uploadFile(marketingFile);
        if (marketingData.marketingAnalytics && marketingData.marketingAnalytics.weeks_data?.length > 0) {
          setMarketingAnalytics(marketingData.marketingAnalytics);
          showToast("Marketing data uploaded successfully.");
        } else {
          setMarketingAnalytics(null);
          showToast("Marketing file uploaded, but no analytics returned.");
        }
      }

      showToast("Weekly bookings uploaded successfully.");
    } catch (err: any) {
      console.error("Run App failed:", err);
      showToast(err.message || "Failed to process files. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- JSX ---------------- //
  return (
    <div className="bg-white min-h-screen p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        School Bookings Weekly Insights Generator
      </h1>

      {/* Upload Forms */}
      <div className="flex flex-col md:flex-row gap-6 mb-4">
        <UploadForm label="Weekly Bookings" onFileSelected={setBookingsFile} />
        <UploadForm label="Marketing Weekly" onFileSelected={setMarketingFile} />
      </div>

      {/* Run App Button */}
      <div className="mb-8">
        <button
          onClick={handleRunApp}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Processing..." : "Run App"}
        </button>
      </div>

      {/* Dashboard */}
      <Dashboard
        customerSegments={customerSegments}
        weeklyCharges={weeklyCharges}
        busUsage={busUsage}
        marketingAnalytics={marketingAnalytics}
        loading={loading}
      />

      {/* Toast */}
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}
