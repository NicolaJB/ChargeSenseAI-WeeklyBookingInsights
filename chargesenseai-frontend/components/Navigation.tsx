"use client";

export default function Navigation() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">ChargeSenseAI</h1>
        <div className="flex gap-4">
          <a href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">Dashboard</a>
        </div>
      </div>
    </nav>
  );
}
