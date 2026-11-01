"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  BookOpen,
  BookPlus,
  BookMarked,
  Mail,
  UserRound,
  LogIn,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login?callbackURL=/profile");
    }
  }, [isPending, user, router]);

  // Loading state
  if (isPending || !user) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-emerald-600" />

        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading your profile...
        </p>
      </div>
    );
  }

  const userName = user.name || "BookNook User";
  const userEmail = user.email || "";
  const userImage = user.image;

  const quickLinks = [
    {
      name: "Add Book",
      description: "Share a new book with the BookNook community.",
      href: "/add-book",
      icon: BookPlus,
    },
    {
      name: "My Books",
      description: "Manage the books you have added to BookNook.",
      href: "/my-books",
      icon: BookMarked,
    },
    {
      name: "My Borrows",
      description: "See your borrowed books and return them on time.",
      href: "/my-borrows",
      icon: BookOpen,
    },
  ];

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Page Heading */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <UserRound size={25} />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                My Profile
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Your BookNook account information.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="flex flex-col items-center gap-5 border-b border-slate-100 bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-10 text-center sm:flex-row sm:gap-6 sm:px-10 sm:text-left">
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="h-20 w-20 rounded-full border-4 border-white/30 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/15 text-white shadow-lg">
                <UserRound size={38} />
              </div>
            )}

            <div className="min-w-0">
              <h2 className="truncate text-2xl font-extrabold text-white">
                {userName}
              </h2>

              <p className="mt-2 flex items-center justify-center gap-2 truncate text-sm text-emerald-100 sm:justify-start">
                <Mail size={16} />
                {userEmail}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 sm:p-10">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
              <LogIn size={16} />
              Quick Actions
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                  >
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:scale-105">
                      <Icon size={22} />
                    </div>

                    <h4 className="font-bold text-slate-900">{item.name}</h4>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
