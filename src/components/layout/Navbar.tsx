"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Home,
  Library,
  Menu,
  X,
  LogIn,
  UserPlus,
  UserRound,
  LogOut,
  BookPlus,
  BookMarked,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

const publicLinks = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "All Books",
    href: "/books",
    icon: Library,
  },
];

const privateLinks = [
  {
    name: "Add Book",
    href: "/add-book",
    icon: BookPlus,
  },
  {
    name: "My Books",
    href: "/my-books",
    icon: BookMarked,
  },
  {
    name: "My Borrows",
    href: "/my-borrows",
    icon: BookOpen,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isLoggedIn = !!session?.user;

  const user = session?.user;

  const userName = user?.name || "BookNook User";
  const userEmail = user?.email || "";
  const userImage = user?.image;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const closeMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await authClient.signOut();

      closeMenus();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const renderLink = (
    link: (typeof publicLinks)[number] | (typeof privateLinks)[number],
  ) => {
    const Icon = link.icon;
    const active = isActive(link.href);

    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={closeMenus}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
          active
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
            : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
        }`}
      >
        <Icon size={16} strokeWidth={2} />
        {link.name}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[76px] items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenus}
            className="group flex shrink-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 transition-transform duration-200 group-hover:scale-105">
              <BookOpen size={25} strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Book<span className="text-emerald-600">Nook</span>
              </h1>
              <p className="-mt-1 text-[10px] font-semibold uppercase tracking-[2px] text-slate-400">
                Your Reading Corner
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {publicLinks.map(renderLink)}

            {isLoggedIn && privateLinks.map(renderLink)}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {isPending ? (
              <div className="h-10 w-24 animate-pulse rounded-full bg-slate-100" />
            ) : isLoggedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition hover:border-emerald-300 hover:bg-emerald-50"
                  aria-expanded={profileOpen}
                  aria-label="Open profile menu"
                >
                  {userImage ? (
                    <img
                      src={userImage}
                      alt={userName}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <UserRound size={19} />
                    </div>
                  )}

                  <span className="max-w-28 truncate text-sm font-semibold text-slate-700">
                    {userName}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-900/10">
                    <div className="border-b border-slate-100 px-3 py-3">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {userName}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {userEmail}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={closeMenus}
                      className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <UserRound size={17} />
                      My Profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <LogOut size={17} />
                      {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <LogIn size={17} />
                  Login
                </Link>

                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
                >
                  <UserPlus size={17} />
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-emerald-50 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="border-t border-slate-100 py-4 lg:hidden">
            <nav className="flex flex-col gap-2">
              {publicLinks.map(renderLink)}

              {isLoggedIn && (
                <>
                  <div className="my-2 border-t border-slate-100" />
                  {privateLinks.map(renderLink)}
                </>
              )}
            </nav>

            <div className="mt-4 border-t border-slate-100 pt-4">
              {isPending ? (
                <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
              ) : isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt={userName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <UserRound size={20} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {userName}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-emerald-50"
                  >
                    <UserRound size={17} />
                    My Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={closeMenus}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <LogIn size={17} />
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMenus}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <UserPlus size={17} />
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
