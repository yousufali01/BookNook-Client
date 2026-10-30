
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import {
  BookOpen,
  UserRound,
  Mail,
  ArrowLeft,
  Loader2,
  CalendarDays,
  BookMarked,
} from "lucide-react";

type Book = {
  _id: string;
  title: string;
  author: string;
  category: string;
  image: string;
  description: string;
  addedByName?: string;
  addedByEmail?: string;
  createdAt?: string;
};

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  // Protect this page
  useEffect(() => {
    if (!isPending && !user) {
      router.replace(`/login?redirect=/books/${id}`);
    }
  }, [isPending, user, router, id]);

  // Fetch book details
  useEffect(() => {
    if (isPending || !user || !id) return;

    const fetchBookDetails = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        toast.error("Backend API URL is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const baseUrl = apiUrl.replace(/\/+$/, "");

        const response = await axios.get(
          `${baseUrl}/api/books/${id}`
        );

        const result = response.data;

        const bookData =
          result?.book ??
          result?.data?.book ??
          result?.data ??
          result;

        if (!bookData || !bookData._id) {
          throw new Error("Book not found.");
        }

        setBook(bookData);
      } catch (error) {
        console.error("Book Details Error:", error);

        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message ||
              "Failed to load book details."
          );
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong.");
        }

        setBook(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, user, isPending]);

  // Borrow button placeholder
  const handleBorrow = () => {
    toast("Borrow functionality will be available soon!");
  };

  if (isPending || !user || loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center">
        <Loader2
          size={38}
          className="animate-spin text-emerald-600"
        />
        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading book details...
        </p>
      </div>
    );
  }

  if (!book) {
    return (
      <section className="flex min-h-[65vh] flex-col items-center justify-center px-4 text-center">
        <BookOpen size={55} className="text-slate-300" />

        <h1 className="mt-5 text-2xl font-bold text-slate-800">
          Book Not Found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          The book you are looking for does not exist.
        </p>

        <Link
          href="/books"
          className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          Back to All Books
        </Link>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <Link
          href="/books"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-700"
        >
          <ArrowLeft size={18} />
          Back to All Books
        </Link>

        {/* Details Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Book Image */}
            <div className="flex min-h-[400px] items-center justify-center bg-slate-100 p-8 sm:p-12">
              <img
                src={book.image}
                alt={book.title}
                className="max-h-[480px] max-w-full rounded-2xl object-contain shadow-lg"
              />
            </div>

            {/* Book Information */}
            <div className="flex flex-col p-6 sm:p-10 lg:p-12">
              <span className="w-fit rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700">
                {book.category}
              </span>

              <h1 className="mt-5 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
                {book.title}
              </h1>

              <p className="mt-3 text-base text-slate-500">
                Written by{" "}
                <span className="font-bold text-slate-800">
                  {book.author}
                </span>
              </p>

              <div className="my-7 border-t border-slate-100" />

              {/* Description */}
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                  <BookOpen size={20} className="text-emerald-600" />
                  About This Book
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {book.description || "No description available."}
                </p>
              </div>

              {/* Added By */}
              <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-emerald-800">
                  <BookMarked size={18} />
                  Book Information
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600">
                      <UserRound size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">
                        Added By
                      </p>
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {book.addedByName || "BookNook User"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600">
                      <Mail size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">
                        Added By Email
                      </p>
                      <p className="break-all text-sm font-semibold text-slate-800">
                        {book.addedByEmail || "Not available"}
                      </p>
                    </div>
                  </div>

                  {book.createdAt && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600">
                        <CalendarDays size={19} />
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Date Added
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {new Date(book.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Borrow Button */}
              <button
                onClick={handleBorrow}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
              >
                <BookOpen size={19} />
                Borrow This Book
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
