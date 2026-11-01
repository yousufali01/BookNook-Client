"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import toast from "react-hot-toast";
import {
  BookPlus,
  Image as ImageIcon,
  Loader2,
  UserRound,
  Mail,
  Link2,
  Upload,
  Layers,
} from "lucide-react";

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

const baseUrl = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "";

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

export default function AddBookPage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [totalCopies, setTotalCopies] = useState("1");

  const [imageUrl, setImageUrl] = useState(
    "https://i.postimg.cc/SR5rgwsk/images.jpg",
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    description: "",
  });

  const user = session?.user;

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login?redirect=/add-book");
    }
  }, [isPending, user, router]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle image upload to imgbb
  const handleImageUpload = async (file: File) => {
    if (!imgbbApiKey) {
      toast.error(
        "Image upload is not configured. Please paste an image URL instead.",
      );
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be smaller than 8MB.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
        formData,
      );

      const uploadUrl = response.data?.data?.url;

      if (!uploadUrl) {
        throw new Error("Image upload failed.");
      }

      setImageUrl(uploadUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login first.");
      router.push("/login?redirect=/add-book");
      return;
    }

    const trimmedImageUrl = imageUrl.trim();
    const copies = Number(totalCopies);

    if (!trimmedImageUrl) {
      toast.error("Please enter a book image URL.");
      return;
    }

    // Validate image URL
    try {
      const parsedUrl = new URL(trimmedImageUrl);

      if (parsedUrl.protocol !== "https:") {
        toast.error("Please enter a valid HTTPS image URL.");
        return;
      }
    } catch {
      toast.error("Please enter a valid image URL.");
      return;
    }

    if (!Number.isInteger(copies) || copies < 1) {
      toast.error("Total copies must be at least 1.");
      return;
    }

    try {
      setLoading(true);

      // Get JWT authorization headers
      const headers = await getAuthHeaders();

      // Prepare book data
      // User identity will be taken from the verified JWT on the backend.
      const bookData = {
        ...formData,
        image: trimmedImageUrl,
        totalCopies: copies,
      };

      // Save book to MongoDB
      const response = await axios.post(`${baseUrl}/books`, bookData, {
        headers,
      });

      if (response.data?.success) {
        toast.success("Book added successfully!");

        // Reset form
        setFormData({
          title: "",
          author: "",
          category: "",
          description: "",
        });

        setImageUrl("");
        setTotalCopies("1");

        router.refresh();
      } else {
        throw new Error(response.data?.message || "Failed to add book.");
      }
    } catch (error) {
      console.error("Add Book Error:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Your session has expired. Please login again.");
        router.replace("/login?redirect=/add-book");
        return;
      }

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to add book.",
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (isPending || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
      </div>
    );
  }

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <BookPlus size={32} />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Add a New Book
          </h1>

          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Share your favorite book with the BookNook community.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Book Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Book Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter book title"
                required
                maxLength={150}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* Author */}
            <div>
              <label
                htmlFor="author"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Author Name
              </label>

              <input
                id="author"
                name="author"
                type="text"
                value={formData.author}
                onChange={handleChange}
                placeholder="Enter author name"
                required
                maxLength={100}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Category
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">Select a category</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Book Image URL */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="imageUrl"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Book Image
                </label>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || loading}
                  className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Upload From Device
                    </>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                />
              </div>

              <div className="relative">
                <Link2
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste your Postimages direct link"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Paste the Direct Link from Postimages.
              </p>

              {/* Image Preview */}
              {uploading ? (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs font-semibold text-slate-500">
                  <Loader2
                    size={16}
                    className="animate-spin text-emerald-600"
                  />
                  Uploading image to imgbb...
                </div>
              ) : (
                imageUrl.trim() && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <ImageIcon size={16} />
                      Image Preview
                    </p>

                    <img
                      src={imageUrl.trim()}
                      alt="Book preview"
                      className="mx-auto max-h-64 max-w-full rounded-xl object-contain"
                    />
                  </div>
                )
              )}
            </div>

            {/* Total Copies */}
            <div>
              <label
                htmlFor="totalCopies"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Total Copies
              </label>

              <div className="relative">
                <Layers
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="totalCopies"
                  type="number"
                  min={1}
                  step={1}
                  value={totalCopies}
                  onChange={(e) => setTotalCopies(e.target.value)}
                  placeholder="How many copies are available?"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                This number decreases when someone borrows the book and
                increases when it is returned.
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Short Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a short description about this book..."
                required
                maxLength={1000}
                rows={5}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* User Information */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-emerald-800">
                <UserRound size={18} />
                Added By
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="userName"
                    className="mb-2 block text-xs font-semibold text-slate-600"
                  >
                    User Name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="userName"
                      type="text"
                      value={user.name || ""}
                      readOnly
                      className="w-full rounded-xl border border-emerald-100 bg-white py-3 pl-10 pr-4 text-sm text-slate-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="userEmail"
                    className="mb-2 block text-xs font-semibold text-slate-600"
                  >
                    User Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="userEmail"
                      type="email"
                      value={user.email || ""}
                      readOnly
                      className="w-full rounded-xl border border-emerald-100 bg-white py-3 pl-10 pr-4 text-sm text-slate-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Adding Book...
                </>
              ) : (
                <>
                  <BookPlus size={19} />
                  Add Book
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
