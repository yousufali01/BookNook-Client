import Link from "next/link";
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  Heart,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaLinkedinIn,
} from "react-icons/fa6";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "All Books", href: "/books" },
  { name: "Add Book", href: "/add-book" },
  { name: "My Books", href: "/my-books" },
];

const supportLinks = [
  { name: "My Borrows", href: "/my-borrows" },
  { name: "My Profile", href: "/profile" },
  { name: "Login", href: "/login" },
  { name: "Register", href: "/register" },
];

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/",
    icon: FaFacebookF,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/",
    icon: FaInstagram,
  },
  {
    name: "X",
    href: "https://x.com/",
    icon: FaXTwitter,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: FaLinkedinIn,
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <BookOpen size={27} />
              </div>

              <span className="text-2xl font-extrabold tracking-tight text-white">
                Book<span className="text-emerald-400">Nook</span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-400">
              Your little corner of knowledge. Discover amazing books, organize
              your personal collection, and enjoy a better reading experience
              with BookNook.
            </p>

            {/* Social Media Icons */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-base font-bold text-white">Quick Links</h3>

            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-emerald-400"
                  >
                    <ArrowUpRight
                      size={14}
                      className="transition group-hover:translate-x-1"
                    />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-6 text-base font-bold text-white">Explore</h3>

            <ul className="space-y-4">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-emerald-400"
                  >
                    <ArrowUpRight
                      size={14}
                      className="transition group-hover:translate-x-1"
                    />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-base font-bold text-white">
              Get in Touch
            </h3>

            <p className="mb-5 text-sm leading-6 text-slate-400">
              Have a question or suggestion? We would love to hear from you.
            </p>

            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 shrink-0 text-emerald-400" />
                <a
                  href="mailto:hello@booknook.com"
                  className="text-sm text-slate-400 transition hover:text-emerald-400"
                >
                  hello@booknook.com
                </a>
              </li>

              <li className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 shrink-0 text-emerald-400" />
                <a
                  href="tel:+8801000000000"
                  className="text-sm text-slate-400 transition hover:text-emerald-400"
                >
                  +880 1000-000000
                </a>
              </li>

              <li className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />
                <span className="text-sm text-slate-400">Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            © 2026 BookNook. All rights reserved.
          </p>

          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            Made with
            <Heart size={13} className="fill-emerald-500 text-emerald-500" />
            for book lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
