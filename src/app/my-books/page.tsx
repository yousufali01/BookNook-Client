"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  BookOpen,
  Pencil,
  Trash2,
  X,
  Loader2,
  Save,
  AlertCircle,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  image: string;
  description: string;
  addedByName?: string;
  addedByEmail?: string;
  createdAt?: string;
}

interface EditForm {
  title: string;
  author: string;
  category: string;
  image: string;
  description: string;
}

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

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

export default function MyBooksPage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  const [editForm, setEditForm] = useState<EditForm>({
    title: "",
    author: "",
    category: "Fiction",
    image: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const userEmail = session?.user?.email;

  // Fetch only the logged-in user's books
  useEffect(() => {
    if (isPending) return;

    if (!userEmail) {
      router.replace("/login?redirect=/my-books");
      return;
    }

    const fetchMyBooks = async () => {
      try {
        setLoading(true);

        const headers = await getAuthHeaders();

        const response = await axios.get(`${baseUrl}/books`, {
          headers,
        });

        if (response.data?.success) {
          // The backend has no dedicated "my books" endpoint (spec has only
          // 8 endpoints), so filter the complete collection by the verified
          // user's email from the active session.
          const allBooks: Book[] = response.data.data || [];

          setBooks(
            allBooks.filter(
              (book) =>
                (book.addedByEmail || "")?.toLowerCase() ===
                userEmail?.toLowerCase(),
            ),
          );
        } else {
          setBooks([]);
          toast.error(response.data?.message || "Could not load your books.");
        }
      } catch (error) {
        console.error("Fetch My Books Error:", error);

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.error("Your session has expired. Please login again.");
          router.replace("/login?redirect=/my-books");
          return;
        }

        toast.error(
          error instanceof Error ? error.message : "Failed to load books.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyBooks();
  }, [userEmail, isPending, router]);

  // Open edit modal
  const handleEditClick = (book: Book) => {
    setEditingBook(book);

    setEditForm({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "Fiction",
      image: book.image || "",
      description: book.description || "",
    });
  };

  // Update form values
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Update book
  const handleUpdateBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingBook) return;

    if (
      !editForm.title.trim() ||
      !editForm.author.trim() ||
      !editForm.image.trim() ||
      !editForm.description.trim()
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!/^https:\/\/.+/i.test(editForm.image.trim())) {
      toast.error("Please enter a valid HTTPS image URL.");
      return;
    }

    try {
      setSaving(true);

      const headers = await getAuthHeaders();

      const response = await axios.patch(
        `${baseUrl}/books/${editingBook._id}`,
        {
          title: editForm.title.trim(),
          author: editForm.author.trim(),
          category: editForm.category,
          image: editForm.image.trim(),
          description: editForm.description.trim(),
        },
        { headers },
      );

      if (response.data?.success) {
        const updatedBook = response.data.data;

        setBooks((previous) =>
          previous.map((book) =>
            book._id === editingBook._id ? { ...book, ...updatedBook } : book,
          ),
        );

        toast.success("Book updated successfully!");
        setEditingBook(null);
      } else {
        toast.error(response.data?.message || "Failed to update book.");
      }
    } catch (error) {
      console.error("Update Book Error:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Your session has expired. Please login again.");
        router.replace("/login?redirect=/my-books");
        return;
      }

      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to update book."
          : error instanceof Error
            ? error.message
            : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete book
  const handleDeleteBook = async () => {
    if (!deletingBook) return;

    try {
      setDeleting(true);

      const headers = await getAuthHeaders();

      const response = await axios.delete(
        `${baseUrl}/books/${deletingBook._id}`,
        { headers },
      );

      if (response.data?.success) {
        setBooks((previous) =>
          previous.filter((book) => book._id !== deletingBook._id),
        );

        toast.success("Book deleted successfully!");
        setDeletingBook(null);
      } else {
        toast.error(response.data?.message || "Failed to delete book.");
      }
    } catch (error) {
      console.error("Delete Book Error:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Your session has expired. Please login again.");
        router.replace("/login?redirect=/my-books");
        return;
      }

      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to delete book."
          : error instanceof Error
            ? error.message
            : "Something went wrong.",
      );
    } finally {
      setDeleting(false);
    }
  };

  // Loading state
  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-gray-500">
            Loading your books...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Heading */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-600">
              <BookOpen size={22} />
              <span className="text-sm font-semibold uppercase tracking-wider">
                BookNook Library
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              My Books
            </h1>

            <p className="mt-2 text-gray-500">
              Manage the books you have added to BookNook.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-100 bg-white px-5 py-3 shadow-sm">
            <BookOpen className="text-emerald-600" size={20} />
            <span className="font-semibold text-gray-700">
              {books.length} {books.length === 1 ? "Book" : "Books"}
            </span>
          </div>
        </div>

        {/* Empty State */}
        {books.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <BookOpen size={30} className="text-emerald-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              No Books Added Yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              You have not added any books to the library yet. Add your first
              book and manage it from here.
            </p>

            <button
              onClick={() => router.push("/add-book")}
              className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Add Your First Book
            </button>
          </div>
        ) : (
          /* Books Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <article
                key={book._id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/600x800?text=Book+Image";
                    }}
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow">
                    {book.category}
                  </span>
                </div>

                <div className="p-5">
                  <h2 className="line-clamp-1 text-xl font-bold text-gray-900">
                    {book.title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">By {book.author}</p>

                  <p className="mt-4 line-clamp-3 min-h-[60px] text-sm leading-6 text-gray-600">
                    {book.description}
                  </p>

                  <div className="mt-5 flex gap-3 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => handleEditClick(book)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-600 px-3 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => setDeletingBook(book)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Edit Book Modal */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="my-8 w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Book</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update your book information.
                </p>
              </div>

              <button
                onClick={() => setEditingBook(null)}
                disabled={saving}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                aria-label="Close edit modal"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleUpdateBook} className="space-y-4 p-6">
              <div>
                <label
                  htmlFor="title"
                  className="mb-1.5 block text-sm font-semibold text-gray-700"
                >
                  Book Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={editForm.title}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="author"
                  className="mb-1.5 block text-sm font-semibold text-gray-700"
                >
                  Author
                </label>
                <input
                  id="author"
                  name="author"
                  type="text"
                  value={editForm.author}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-1.5 block text-sm font-semibold text-gray-700"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={editForm.category}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="image"
                  className="mb-1.5 block text-sm font-semibold text-gray-700"
                >
                  Book Image URL
                </label>
                <input
                  id="image"
                  name="image"
                  type="url"
                  value={editForm.image}
                  onChange={handleInputChange}
                  required
                  placeholder="https://example.com/book-image.jpg"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {editForm.image && (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={editForm.image}
                    alt="Book preview"
                    className="h-40 w-full object-contain"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-semibold text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertCircle size={28} className="text-red-600" />
            </div>

            <h2 className="text-center text-xl font-bold text-gray-900">
              Delete This Book?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {deletingBook.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={() => setDeletingBook(null)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteBook}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete Book
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
