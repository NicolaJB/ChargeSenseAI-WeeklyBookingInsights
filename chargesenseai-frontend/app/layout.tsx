import { ReactNode } from "react";
import Image from "next/image";
import "../styles/globals.css"; // Tailwind + global styles
import schoolLogo from "../components/school-logo.png"; // adjust path if needed

export const metadata = {
  title: "ChargeSenseAI: Sutton High",
  description: "Upload and analyze school booking data",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Header with title and logo */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold">ChargeSense AI: Sutton High School GDST</h1>
          <div className="h-12 w-12 relative">
            <Image
              src={schoolLogo}
              alt="School Logo"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Main content */}
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
