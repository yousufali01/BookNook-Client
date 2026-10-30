
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import {
  BookOpen,
  Loader2,
  Pencil,
  Trash2,
  X,
  Save,
  UserRound,
  RefreshCw,
  BookX,
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

type EditForm = {
  title: string;
  author: string;
  category: string;
  image: string;
  description: string;
};

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

const initialForm: EditForm = {
  title: "",
  author: "",
  category: "",
  image: "",
  description: "",
};

export default function MyBooksPage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const userEmail = user?.email;

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<EditForm>(initialForm);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!isPending && !userEmail) {
      router.replace("/login?redirect=/my-books");
    }
  }, [isPending, userEmail, router]);

  // Fetch logged-in user's books
  const fetchMyBooks = useCallback(async () => {
    if (!userEmail) return;

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
        `${baseUrl}/api/my-books`,
        {
          params: {
            email: userEmail,
          },
        }
      );

      if (response.data?.success) {
        const bookList = response.data.data;

        setBooks(Array.isArray(bookList) ? bookList : []);
      } else {
        throw new Error(
          response.data?.message || "Failed to load your books."
        );
      }
    } catch (error) {
      console.error("Fetch My Books Error:", error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to load your books."
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong.");
      }

      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (!isPending && userEmail) {
      fetchMyBooks();
    }
  }, [isPending, userEmail, fetchMyBooks]);

  // Open edit modal
  const openEditModal = (book: Book) => {
    setEditingBook(book);

    setFormData({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      image: book.image || "",
      description: book.description || "",
    });
  };

  // Close edit modal
  const closeEditModal = () => {
    if (saving) return;

    setEditingBook(null);
    setFormData(initialForm);
  };

  // Handle form changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Update book
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingBook || !userEmail) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      toast.error("Backend API URL is missing.");
      return;
    }

    // Validate image URL
    try {
      const parsedUrl = new URL(formData.image.trim());

      if (parsedUrl.protocol !== "https:") {
        toast.error("Please enter a valid HTTPS image URL.");
        return;
      }
    } catch {
      toast.error("Please enter a valid image URL.");
      return;
    }

    try {
      setSaving(true);

      const baseUrl = apiUrl.replace(/\/+$/, "");

      const response = await axios.put(
        `${baseUrl}/api/books/${editingBook._id}`,
        {
          title: formData.title.trim(),
          author: formData.author.trim(),
          category: formData.category,
          image: formData.image.trim(),
          description: formData.description.trim(),

          // Backend ownership validation requires this field
          addedByEmail: userEmail,
        }
      );

      if (response.data?.success) {
        toast.success("Book updated successfully!");

        setEditingBook(null);
        setFormData(initialForm);

        await fetchMyBooks();
      } else {
        throw new Error(
          response.data?.message || "Failed to update book."
        );
      }
    } catch (error) {
      console.error("Update Book Error:", error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to update book."
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Delete book
  const handleDelete = async () => {
    if (!deletingBook || !userEmail) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      toast.error("Backend API URL is missing.");
      return;
    }

    try {
      setDeleting(true);

      const baseUrl = apiUrl.replace(/\/+$/, "");

      const response = await axios.delete(
        `${baseUrl}/api/books/${deletingBook._id}`,
        {
          params: {
            email: userEmail,
          },
        }
      );

      if (response.data?.success) {
        toast.success("Book deleted successfully!");

        setBooks((previous) =>
          previous.filter((book) => book._id !== deletingBook._id)
        );

        setDeletingBook(null);
      } else {
        throw new Error(
          response.data?.message || "Failed to delete book."
        );
      }
    } catch (error) {
      console.error("Delete Book Error:", error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to delete book."
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setDeleting(false);
    }
  };

  // Loading and authentication state
  if (isPending || !userEmail) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          size={38}
          className="animate-spin text-emerald-600"
        />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <BookOpen size={32} />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            My Books
          </h1>

          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Manage the books you have shared with the BookNook community.
          </p>

          <p className="mt-3 text-sm font-semibold text-emerald-700">
            {books.length} Books Added
          </p>
        </div>

        {/* User Information */}
        <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-700">
              <UserRound size={22} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                {user?.name || "BookNook User"}
              </p>

              <p className="text-xs text-slate-500">
                {userEmail}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchMyBooks}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Books
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[35vh] flex-col items-center justify-center">
            <Loader2
              size={38}
              className="animate-spin text-emerald-600"
            />

            <p className="mt-4 text-sm text-slate-500">
              Loading your books...
            </p>
          </div>
        ) : books.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-[35vh] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-4 text-center">
            <BookX size={50} className="text-slate-300" />

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              You Haven&apos;t Added Any Books
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add your first book and share it with the community.
            </p>

            <button
              type="button"
              onClick={() => router.push("/add-book")}
              className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Add Your First Book
            </button>
          </div>
        ) : (
          /* Books Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <div
                key={book._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative flex h-60 items-center justify-center bg-slate-100 p-4">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="h-full w-full rounded-xl object-contain"
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                    {book.category}
                  </span>
                </div>

                <div className="p-5">
                  <h2 className="line-clamp-1 text-xl font-bold text-slate-900">
                    {book.title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    By{" "}
                    <span className="font-semibold text-slate-700">
                      {book.author}
                    </span>
                  </p>

                  <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-6 text-slate-500">
                    {book.description}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(book)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingBook(book)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={closeEditModal}
        >
          <div
            className="my-auto w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Edit Book
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your book information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label
                  htmlFor="edit-title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Book Title
                </label>

                <input
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength={150}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-author"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Author Name
                </label>

                <input
                  id="edit-author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Category
                </label>

                <select
                  id="edit-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="">Select a category</option>

                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-image"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Book Image URL
                </label>

                <input
                  id="edit-image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              {formData.image.trim() && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-emerald-700">
                    Image Preview
                  </p>

                  <img
                    src={formData.image}
                    alt="Book preview"
                    className="mx-auto max-h-40 rounded-lg object-contain"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="edit-description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Short Description
                </label>

                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  maxLength={1000}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
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
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!deleting) setDeletingBook(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 size={30} />
            </div>

            <h2 className="mt-5 text-2xl font-extrabold text-slate-900">
              Delete This Book?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-800">
                {deletingBook.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setDeletingBook(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Yes, Delete
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
