"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

/* =========================================
   BOOK TYPE
========================================= */

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  description?: string;
  image: string;
  totalCopies: number;
  availableCopies: number;
}

interface BooksResponse {
  success: boolean;
  message: string;
  data: Book[];
}

/* =========================================
   API CONFIGURATION
========================================= */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* =========================================
   HERO SLIDER DATA
========================================= */

const slides = [
  {
    tag: "WELCOME TO BOOKNOOK",
    title: "Every Book Opens a New World",
    description:
      "Discover your next favorite read from our growing collection of books. Your reading journey starts here.",
    button: "Browse Books",
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1000",
  },
  {
    tag: "EXPLORE YOUR NEXT READ",
    title: "Find Stories That Inspire You",
    description:
      "Explore different genres, discover new authors, and find books that match your interests.",
    button: "Explore Collection",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000",
  },
  {
    tag: "READ MORE, DISCOVER MORE",
    title: "A Little Reading Goes a Long Way",
    description:
      "Make time for great stories, fresh ideas, and knowledge that stays with you.",
    button: "Start Exploring",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1000",
  },
];

/* =========================================
   CATEGORY DATA
========================================= */

const categories = [
  { name: "Fiction", icon: "📖", color: "bg-blue-50" },
  { name: "Science", icon: "🔬", color: "bg-purple-50" },
  { name: "History", icon: "🏛️", color: "bg-amber-50" },
  { name: "Thriller", icon: "🔍", color: "bg-rose-50" },
  { name: "Biography", icon: "👤", color: "bg-emerald-50" },
  {
    name: "Self Development",
    icon: "🌱",
    color: "bg-orange-50",
  },
];

/* =========================================
   HOME PAGE
========================================= */

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================
     FETCH LATEST BOOKS FROM BACKEND
  ========================================= */

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/api/books?limit=6`);

        if (!response.ok) {
          throw new Error(`Books API failed: ${response.status}`);
        }

        const result: BooksResponse = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("Invalid books API response");
        }

        setBooks(result.data);
      } catch (error) {
        console.error("Books API Error:", error);

        setError("Books could not be loaded. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* =====================================
          HERO SLIDER
          (wrapped in Suspense so the Swiper
          library can stream safely on the server)
      ===================================== */}

      <Suspense
        fallback={
          <div className="relative overflow-hidden rounded-3xl">
            <div className="flex min-h-[440px] items-center justify-center bg-slate-100 sm:min-h-[500px]">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
            </div>
          </div>
        }
      >
        <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl">
            <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            slidesPerView={1}
            loop
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            navigation
            className="home-hero-swiper"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={slide.title}>
                <div
                  className="relative flex min-h-[440px] items-center bg-cover bg-center px-7 py-16 sm:min-h-[500px] sm:px-14 lg:px-20"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${
                      index === 0
                        ? "rgba(2, 6, 23, .94), rgba(15, 23, 42, .45)"
                        : index === 1
                          ? "rgba(30, 27, 75, .94), rgba(49, 46, 129, .35)"
                          : "rgba(2, 44, 34, .94), rgba(6, 78, 59, .35)"
                    }), url("${slide.image}")`,
                  }}
                >
                  <div className="relative z-10 max-w-2xl pb-8 text-white">
                    <span className="mb-5 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-emerald-200 backdrop-blur">
                      {slide.tag}
                    </span>

                    <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                      {slide.title}
                    </h1>

                    <p className="mb-8 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
                      {slide.description}
                    </p>

                    <Link
                      href="/books"
                      className="inline-flex items-center gap-3 rounded-xl bg-emerald-500 px-7 py-4 font-semibold text-white shadow-lg transition hover:bg-emerald-600"
                    >
                      {slide.button}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>

                  <div className="absolute bottom-8 right-8 hidden text-sm font-medium text-white/70 sm:block">
                    0{index + 1} / 03
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          </div>
        </section>
      </Suspense>

      {/* =====================================
          NEW ARRIVALS
          REAL DATA FROM MONGODB API
      ===================================== */}

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="mb-3 block text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
              Fresh From Our Library
            </span>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              New Arrivals
            </h2>

            <p className="mt-3 max-w-xl text-slate-500">
              Explore the latest additions to our collection and find your next
              favorite book.
            </p>
          </div>

          <Link
            href="/books"
            className="inline-flex items-center gap-2 font-semibold text-emerald-700 transition hover:text-emerald-900"
          >
            See All Books <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* BOOK LOADING / ERROR / EMPTY / DATA */}

        {loading ? (
          <div className="grid min-h-64 place-items-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />

              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading latest books...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 px-6 py-12 text-center">
            <p className="font-medium text-red-600">{error}</p>
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-6 py-12 text-center">
            <p className="text-slate-500">No books available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {books.map((book) => (
              <article
                key={book._id}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={book.image || "https://placehold.co/400x600?text=Book"}
                    alt={book.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                    New
                  </span>
                </div>

                <div className="p-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    {book.category}
                  </span>

                  <h3 className="mt-2 line-clamp-1 text-base font-bold text-slate-900">
                    {book.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    By {book.author}
                  </p>

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

        <div className="mt-10 text-center">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 font-semibold text-white shadow-md transition hover:bg-emerald-700"
          >
            See All Books <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* =====================================
          HOW BORROWING WORKS
      ===================================== */}

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="mb-3 block text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
              Simple & Easy
            </span>

            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              How Borrowing Works
            </h2>

            <p className="mt-4 leading-7 text-slate-500">
              Getting your next great read is simple. Follow these three easy
              steps and start reading.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                number: "01",
                icon: "🔎",
                title: "Discover a Book",
                description:
                  "Browse our collection and explore books from different categories and authors.",
              },
              {
                number: "02",
                icon: "📚",
                title: "Borrow Your Book",
                description:
                  "Choose an available book and submit your borrow request from its details page.",
              },
              {
                number: "03",
                icon: "💚",
                title: "Enjoy & Return",
                description:
                  "Enjoy your reading journey and return the book when you are finished.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="relative rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="absolute right-6 top-5 text-4xl font-black text-slate-100">
                  {step.number}
                </span>

                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                  {step.icon}
                </div>

                <h3 className="mb-3 text-xl font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="leading-7 text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================
          EXPLORE CATEGORIES
      ===================================== */}

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="mb-3 block text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
            Find Your Interest
          </span>

          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Explore Categories
          </h2>

          <p className="mt-4 text-slate-500">
            A world of knowledge and imagination, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href="/books"
              className={`${category.color} group flex min-h-40 flex-col items-center justify-center rounded-2xl border border-transparent p-5 text-center transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg`}
            >
              <span className="mb-4 text-4xl transition group-hover:scale-110">
                {category.icon}
              </span>

              <h3 className="font-bold text-slate-800">{category.name}</h3>

              <span className="mt-2 text-xs font-medium text-slate-500 transition group-hover:text-emerald-700">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* =====================================
          CALL TO ACTION
      ===================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-emerald-950 px-7 py-14 text-center text-white sm:px-12">
          <span className="mb-4 block text-4xl">📚</span>

          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to Find Your Next Favorite Book?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-emerald-100/80">
            Explore our library, discover interesting stories, and make reading
            a part of your everyday life.
          </p>

          <Link
            href="/books"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-emerald-900 transition hover:bg-emerald-100"
          >
            Browse All Books <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
