import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "BookNook | Your Reading Corner",
    template: "%s | BookNook",
  },
  description:
    "Discover, organize, and manage your personal book collection with BookNook.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-800 antialiased">
        <Suspense fallback={<div className="h-20" />}>
          <Navbar />
        </Suspense>

        <main className="flex-1">{children}</main>

        <Footer />

        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: { borderRadius: "12px", fontSize: "14px" },
          }}
        />
      </body>
    </html>
  );
}