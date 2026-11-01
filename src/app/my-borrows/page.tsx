"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  RotateCcw,
  BookMarked,
} from "lucide-react";

type Borrow = {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  userEmail: string;
  borrowDate: string;
  returnDate: string;
  isReturned: boolean;
  returnedAt?: string | null;
};

const baseUrl = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

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

// Format Date without reading the current date during rendering
const formatDate = (dateString?: string | null) => {
  if (!dateString) return "Not available";

  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return "Not available";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return "Not available";
  }

  return `${monthNames[month - 1]} ${day}, ${year}`;
};

export default function MyBorrowsPage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [returnTarget, setReturnTarget] = useState<Borrow | null>(null);

  // Redirect logged-out users
  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login?redirect=/my-borrows");
    }
  }, [isPending, user, router]);

  // Fetch logged-in user's borrowed books
  useEffect(() => {
    if (isPending || !user) return;

    const fetchBorrows = async (signal?: AbortSignal) => {
      try {
        const headers = await getAuthHeaders();

        const response = await axios.get(`${baseUrl}/borrows`, {
          headers,
          signal,
        });

        const result = response.data;

        const borrowData =
          result?.data?.borrows ?? result?.data ?? result?.borrows ?? [];

        if (!Array.isArray(borrowData)) {
          throw new Error("Invalid borrowing data received from server.");
        }

        if (!signal?.aborted) {
          setBorrows(borrowData);
        }
      } catch (error) {
        if (
          axios.isCancel(error) ||
          (axios.isAxiosError(error) && error.code === "ERR_CANCELED")
        ) {
          return;
        }

        console.error("My Borrows Error:", error);

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.error("Your session has expired. Please login again.");
          router.replace("/login?redirect=/my-borrows");
          return;
        }

        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message ||
              "Failed to load your borrowed books.",
          );
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong.");
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    };

    const controller = new AbortController();

    fetchBorrows(controller.signal);

    return () => {
      controller.abort();
    };
  }, [isPending, user, router]);
  // Return Book (custom modal confirms first)
  const handleReturnBook = async () => {
    if (!returnTarget) return;

    try {
      setReturningId(returnTarget._id);

      const headers = await getAuthHeaders();

      // The backend deletes the borrow record and increases copies using $inc
      const response = await axios.delete(
        `${baseUrl}/borrows/${returnTarget._id}`,
        { headers },
      );

      if (response.data?.success) {
        setBorrows((previousBorrows) =>
          previousBorrows.filter((borrow) => borrow._id !== returnTarget._id),
        );

        toast.success("Book returned successfully!");
        setReturnTarget(null);
      } else {
        throw new Error(
          response.data?.message || "Failed to return this book.",
        );
      }
    } catch (error) {
      console.error("Return Book Error:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Your session has expired. Please login again.");
        router.replace("/login?redirect=/my-borrows");
        return;
      }

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to return this book.",
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setReturningId(null);
    }
  };

  // Loading state
  if (isPending || !user || loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-emerald-600" />

        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading your borrowed books...
        </p>
      </div>
    );
  }

  const activeBorrows = borrows.filter((borrow) => !borrow.isReturned);

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Heading */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <BookMarked size={25} />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                My Borrows
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your borrowed books and return them on time.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Currently Borrowed */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Currently Borrowed
                </p>

                <h2 className="mt-2 text-3xl font-extrabold text-emerald-700">
                  {activeBorrows.length}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BookOpen size={24} />
              </div>
            </div>
          </div>

          {/* Returned Books */}
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Borrow Records
                </p>

                <h2 className="mt-2 text-3xl font-extrabold text-blue-700">
                  {borrows.length}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Borrowed Books Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Table Header */}
          <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Borrowing History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                All books you have borrowed from BookNook.
              </p>
            </div>

            <span className="w-fit rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
              {borrows.length} Total Records
            </span>
          </div>

          {borrows.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <BookOpen size={38} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-800">
                No Borrowed Books Yet
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                You have not borrowed any books yet. Explore our library and
                find something interesting to read.
              </p>

              <button
                onClick={() => router.push("/books")}
                className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Browse Books
              </button>
            </div>
          ) : (
            /* Borrowing History Table */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Book</th>
                    <th className="px-6 py-4">Borrow Date</th>
                    <th className="px-6 py-4">Return Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {borrows.map((borrow) => (
                    <tr
                      key={borrow._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      {/* Book Information */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={borrow.bookImage}
                            alt={borrow.bookTitle}
                            className="h-16 w-12 rounded-lg border border-slate-200 object-cover"
                          />

                          <div className="max-w-[230px]">
                            <p className="line-clamp-2 text-sm font-bold text-slate-800">
                              {borrow.bookTitle}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              BookNook Library
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Borrow Date */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays
                            size={16}
                            className="text-emerald-600"
                          />

                          {formatDate(borrow.borrowDate)}
                        </div>
                      </td>

                      {/* Return Date */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock3 size={16} className="text-emerald-600" />

                          {formatDate(borrow.returnDate)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        {borrow.isReturned ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                            <CheckCircle2 size={14} />
                            Returned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                            <Clock3 size={14} />
                            Borrowed
                          </span>
                        )}
                      </td>

                      {/* Return Action */}
                      <td className="px-6 py-5 text-center">
                        {borrow.isReturned ? (
                          <span className="text-xs font-semibold text-slate-400">
                            Completed
                          </span>
                        ) : (
                          <button
                            onClick={() => setReturnTarget(borrow)}
                            disabled={returningId === borrow._id}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {returningId === borrow._id ? (
                              <>
                                <Loader2 size={15} className="animate-spin" />
                                Returning...
                              </>
                            ) : (
                              <>
                                <RotateCcw size={15} />
                                Return Book
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Information */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <Clock3 size={19} className="mt-0.5 shrink-0 text-blue-600" />

          <p className="text-xs leading-6 text-blue-800">
            Please return borrowed books within the assigned return date. Once a
            book is returned, its status will be updated in your borrowing
            history.
          </p>
        </div>
      </div>

      {/* Return Confirmation Modal */}
      {returnTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-5 px-1 py-3">
              <img
                src={returnTarget.bookImage}
                alt={returnTarget.bookTitle}
                className="h-20 w-16 rounded-lg border border-slate-200 object-cover"
              />

              <div className="min-w-0">
                <p className="line-clamp-2 font-bold text-slate-900">
                  {returnTarget.bookTitle}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Borrowed on {formatDate(returnTarget.borrowDate)}
                </p>
              </div>
            </div>

            <h2 className="text-center text-xl font-bold text-gray-900">
              Return this book?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              The borrow record will be removed and the copy will again become
              available for other readers.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={() => setReturnTarget(null)}
                disabled={returningId === returnTarget._id}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleReturnBook}
                disabled={returningId === returnTarget._id}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {returningId === returnTarget._id ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Returning...
                  </>
                ) : (
                  <>
                    <RotateCcw size={18} />
                    Confirm Return
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
