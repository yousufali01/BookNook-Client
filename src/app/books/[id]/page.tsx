"use client";

import { Suspense, useEffect, useState } from "react";
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
  X,
  CheckCircle,
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

const baseUrl = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// Format book date
function formatBookDate(dateString?: string) {
  if (!dateString) return "";

  const datePart = dateString.split("T")[0];
  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) {
    return "Date unavailable";
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthIndex = Number(month) - 1;

  if (
    !Number.isInteger(monthIndex) ||
    monthIndex < 0 ||
    monthIndex > 11 ||
    Number(day) < 1 ||
    Number(day) > 31
  ) {
    return "Date unavailable";
  }

  return `${monthNames[monthIndex]} ${Number(day)}, ${year}`;
}

// Get JWT token from BetterAuth
const getAuthHeaders = async () => {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new Error(
      error?.message || "Authentication token not found. Please login again.",
    );
  }

  return {
    Authorization: `Bearer ${data.token}`,
  };
};

// Main Book Details Content
function BookDetailsContent() {
  const params = useParams();
  const router = useRouter();

  // Safely extract id
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId || "";

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [borrowing, setBorrowing] = useState(false);

  // Protect this page
  useEffect(() => {
    if (!isPending && !user && id) {
      router.replace(`/login?redirect=/books/${id}`);
    }
  }, [isPending, user, router, id]);

  // Fetch book details
  useEffect(() => {
    if (isPending || !user || !id) return;

    let isActive = true;

    const fetchBookDetails = async () => {
      try {
        const headers = await getAuthHeaders();

        const response = await axios.get(`${baseUrl}/api/books/${id}`, {
          headers,
        });

        const result = response.data;

        const bookData =
          result?.book ?? result?.data?.book ?? result?.data ?? result;

        if (!bookData || !bookData._id) {
          throw new Error("Book not found.");
        }

        if (isActive) {
          setBook(bookData);
        }
      } catch (error) {
        console.error("Book Details Error:", error);

        if (!isActive) return;

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.error("Your session has expired. Please login again.");
          router.replace(`/login?redirect=/books/${id}`);
          return;
        }

        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || "Failed to load book details.",
          );
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong.");
        }

        setBook(null);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchBookDetails();

    return () => {
      isActive = false;
    };
  }, [id, user, isPending, router]);

  // Open Borrow Modal
  const handleBorrow = () => {
    if (!user) {
      toast.error("Please login first.");
      router.push(`/login?redirect=/books/${id}`);
      return;
    }

    if (!book) return;

    setShowBorrowModal(true);
  };

  // Confirm Borrow
  const handleConfirmBorrow = async () => {
    if (!user || !book) {
      toast.error("Please login first.");
      return;
    }

    try {
      setBorrowing(true);

      const headers = await getAuthHeaders();

      const response = await axios.post(
        `${baseUrl}/api/borrows`,
        {
          bookId: book._id,
        },
        { headers },
      );

      if (response.data?.success) {
        toast.success("Book borrowed successfully!");
        setShowBorrowModal(false);
      } else {
        throw new Error(
          response.data?.message || "Failed to borrow this book.",
        );
      }
    } catch (error) {
      console.error("Borrow Book Error:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Your session has expired. Please login again.");
        router.replace(`/login?redirect=/books/${id}`);
        return;
      }

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "You could not borrow this book.",
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setBorrowing(false);
    }
  };

  // Loading state
  if (isPending || !user || loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center">
        <Loader2 size={38} className="animate-spin text-emerald-600" />
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
    <>
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
                        <p className="text-xs text-slate-500">Added By</p>
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
                        <p className="text-xs text-slate-500">Added By Email</p>
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
                          <p className="text-xs text-slate-500">Date Added</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {formatBookDate(book.createdAt)}
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

      {/* Borrow Confirmation Modal */}
      {showBorrowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Confirm Borrow
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review your information before borrowing.
                </p>
              </div>

              <button
                onClick={() => setShowBorrowModal(false)}
                disabled={borrowing}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X size={21} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-5 p-6">
              <div className="flex items-center gap-4 rounded-xl bg-emerald-50 p-4">
                <img
                  src={book.image}
                  alt={book.title}
                  className="h-20 w-16 rounded-lg object-cover"
                />

                <div className="min-w-0">
                  <h3 className="line-clamp-2 font-bold text-slate-900">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    By {book.author}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">
                    {book.category}
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="borrowerName"
                  className="mb-2 block text-xs font-semibold text-slate-600"
                >
                  Your Name
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="borrowerName"
                    type="text"
                    value={user?.name || ""}
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="borrowerEmail"
                  className="mb-2 block text-xs font-semibold text-slate-600"
                >
                  Your Email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="borrowerEmail"
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <CheckCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <p className="text-xs leading-6 text-slate-600">
                  Please confirm that you want to borrow this book. Your
                  borrowing information will be saved in your account.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowBorrowModal(false)}
                  disabled={borrowing}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmBorrow}
                  disabled={borrowing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {borrowing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <BookOpen size={18} />
                      Confirm Borrow
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Suspense Wrapper
export default function BookDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[65vh] flex-col items-center justify-center">
          <Loader2 size={38} className="animate-spin text-emerald-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading book details...
          </p>
        </div>
      }
    >
      <BookDetailsContent />
    </Suspense>
  );
}