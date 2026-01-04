"use client";

import React, { useState } from "react";
import Dashboard from "../../components/Dashboard";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<{
    customerSegments: any[];
    weeklyCharges: any[];
    chargeDistribution: any[];
    busUsage: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:51115/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4 text-center">
        ChargeSense AI: School Booking Weekly Insights Generator
      </h1>

      {/* Upload form */}
      <div className="bg-white p-6 rounded shadow mb-6 max-w-xl w-full text-center">
        <p className="text-gray-700 mb-4">
          Upload your formatted Excel booking sheet with logs for Monday to Friday complete.
        </p>

        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="mb-4 w-full"
        />
        <div>
          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {/* Dashboard / Placeholder */}
      <div className="w-full max-w-5xl">
        {data ? (
          <Dashboard data={data} />
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Insights Preview</h2>
            <p className="text-gray-700">
              Once you upload your Excel file, weekly insights and charts will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
