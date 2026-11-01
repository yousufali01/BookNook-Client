"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Library, ArrowLeft, Search } from "lucide-react";

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  description?: string;
  image: string;
  totalCopies?: number;
  availableCopies?: number;
  addedByName?: string;
  addedByEmail?: string;
  createdAt?: string;
}

interface BooksResponse {
  success: boolean;
  message: string;
  data: Book[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AllBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  /* Fetch books from the backend API */
  useEffect(() => {
    let isActive = true;

    const fetchBooks = async () => {
      try {
        if (isActive) {
          setLoading(true);
          setError("");
        }

        const response = await fetch(`${API_BASE_URL}/books`);

        if (!response.ok) {
          throw new Error(`Books API failed: ${response.status}`);
        }

        const result: BooksResponse = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("Invalid books API response");
        }

        if (isActive) {
          setBooks(result.data);
        }
      } catch (error) {
        console.error("Books API Error:", error);

        if (isActive) {
          setError("Books could not be loaded. Please try again later.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchBooks();

    return () => {
      isActive = false;
    };
  }, []);

  /* Client-side filter + sort */
  const filteredBooks = books
    .filter((book) => {
      const query = searchQuery.trim().toLowerCase();

      if (!query) {
        return true;
      }

      return (
        book.title?.toLowerCase().includes(query) ||
        book.author?.toLowerCase().includes(query) ||
        book.category?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortOption === "oldest") {
        return (a.createdAt || "").localeCompare(b.createdAt || "");
      }

      if (sortOption === "az") {
        return (a.title || "").localeCompare(b.title || "");
      }

      if (sortOption === "za") {
        return (b.title || "").localeCompare(a.title || "");
      }

      // Newest first (default order from the API)
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Back to Home */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-700"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        {/* Page Heading */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-600">
              <Library size={22} />
              <span className="text-sm font-semibold uppercase tracking-wider">
                BookNook Library
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              All Books
            </h1>

            <p className="mt-2 text-gray-500">
              Browse the complete collection of books shared by the community.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-100 bg-white px-5 py-3 shadow-sm">
            <Library className="text-emerald-600" size={20} />
            <span className="font-semibold text-gray-700">
              {filteredBooks.length}{" "}
              {filteredBooks.length === 1 ? "Book" : "Books"}
            </span>
          </div>
        </div>

        {/* Search + Sort */}
        {!loading && !error && books.length > 0 && (
          <div className="mb-8 flex flex-col gap-4 sm:flex-row">
            <div className="relative max-w-md flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author or category..."
                aria-label="Search books"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              aria-label="Sort books"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:w-auto"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="az">Title A-Z</option>
              <option value="za">Title Z-A</option>
            </select>
          </div>
        )}

        {/* Loading / Error / Empty / Data */}
        {loading ? (
          <div className="grid min-h-64 place-items-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />

              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading books...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
            <p className="font-medium text-red-600">{error}</p>
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <Library size={30} className="text-emerald-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              No Books Available Yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              The library is empty right now. Add the first book and start the
              collection.
            </p>

            <Link
              href="/add-book"
              className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Add Your First Book
            </Link>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <p className="text-sm font-medium text-gray-500">
              No books match your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book) => (
              <article
                key={book._id}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={book.image || "https://placehold.co/400x600?text=Book"}
                    alt={book.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/400x600?text=Book";
                    }}
                  />

                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                    {book.category}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="mt-1 line-clamp-1 text-base font-bold text-slate-900">
                    {book.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">By {book.author}</p>

                  <Link
                    href={`/books/${book._id}`}
                    className="mt-5 flex w-full items-center justify-center rounded-lg border border-emerald-600 px-3 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
