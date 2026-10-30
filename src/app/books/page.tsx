"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import {
  BookOpen,
  Search,
  Loader2,
  UserRound,
  RefreshCw,
  BookX,
} from "lucide-react";

type Book = {
  _id: string;
  id?: string;
  title: string;
  author: string;
  category: string;
  image: string;
  description?: string;
  addedByName?: string;
  createdAt?: string;
};

const categories = [
  "All Categories",
  "Fiction",
  "Science",
  "History",
  "Kids",
  "Others",
];

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const fetchBooks = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      toast.error("Backend API URL is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const baseUrl = apiUrl.replace(/\/+$/, "");
      const response = await axios.get(`${baseUrl}/api/books`);

      // Supports common API response formats
      const result = response.data;

      const bookList = Array.isArray(result)
        ? result
        : Array.isArray(result?.books)
          ? result.books
          : Array.isArray(result?.data)
            ? result.data
            : Array.isArray(result?.data?.books)
              ? result.data.books
              : [];

      setBooks(bookList);
    } catch (error) {
      console.error("Fetch Books Error:", error);
      toast.error("Failed to load books. Please try again.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Categories" ||
        book.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [books, searchTerm, selectedCategory]);

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <BookOpen size={32} />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Explore All Books
          </h1>

          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Discover your next favorite book from our community library.
          </p>

          <p className="mt-3 text-sm font-semibold text-emerald-700">
            {books.length} Books Available
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by book title or author..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            onClick={fetchBooks}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center">
            <Loader2 size={38} className="animate-spin text-emerald-600" />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading books...
            </p>
          </div>
        ) : filteredBooks.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-[35vh] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-4 text-center">
            <BookX size={48} className="text-slate-300" />

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              No Books Found
            </h2>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              {books.length === 0
                ? "No books have been added yet. Be the first to share a book!"
                : "Try another search term or select a different category."}
            </p>

            {books.length > 0 && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All Categories");
                }}
                className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Books Grid */
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Available Books
              </h2>

              <p className="text-sm text-slate-500">
                Showing {filteredBooks.length} books
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => {
                const bookId = book._id || book.id;

                return (
                  <div
                    key={bookId}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Book Image */}
                    <div className="relative flex h-64 items-center justify-center overflow-hidden bg-slate-100 p-4">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="h-full w-full rounded-xl object-contain transition duration-500 group-hover:scale-105"
                      />

                      <span className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow">
                        {book.category}
                      </span>
                    </div>

                    {/* Book Information */}
                    <div className="p-5">
                      <h3 className="line-clamp-1 text-xl font-bold text-slate-900">
                        {book.title}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        By{" "}
                        <span className="font-semibold text-slate-700">
                          {book.author}
                        </span>
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                        <UserRound size={15} />
                        <span>
                          Added by {book.addedByName || "BookNook User"}
                        </span>
                      </div>

                      <Link
                        href={`/books/${bookId}`}
                        className="mt-5 flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
