import Link from "next/link";
import { BookX, ArrowLeft, Library } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-16 sm:px-6">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl" />

      <div className="relative max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 shadow-lg shadow-emerald-200/50">
          <BookX size={40} />
        </div>

        <p className="text-base font-bold uppercase tracking-[0.3em] text-emerald-600">
          404 — Page Not Found
        </p>

        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          This page is out of stock.
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-slate-500">
          The page you are looking for does not exist or may have been moved.
          Head back to the library and keep exploring.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <Link
            href="/books"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-white px-7 py-3.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
          >
            <Library size={18} />
            Browse Books
          </Link>
        </div>
      </div>
    </section>
  );
}
