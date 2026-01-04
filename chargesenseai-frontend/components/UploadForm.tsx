"use client";

import { useState } from "react";
import Toast from "./Toast";

interface UploadFormProps {
  label: string;
  onFileSelected: (file: File) => void;
}

export default function UploadForm({ label, onFileSelected }: UploadFormProps) {
  const [fileName, setFileName] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelected(file);
      setToastMessage(`Selected file: ${file.name}`);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-2 w-full sm:w-auto">
      <label className="font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        className="border p-2 rounded w-full sm:w-auto text-gray-800 placeholder:text-gray-700"
      />
      {fileName && <p className="text-sm text-gray-600 mt-1">Selected: {fileName}</p>}
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}
