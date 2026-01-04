"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  duration?: number;
}

export default function Toast({ message, duration = 3000 }: ToastProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!show) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-gray-800 text-white px-4 py-2 rounded shadow-lg animate-slide-in">
      {message}
    </div>
  );
}
