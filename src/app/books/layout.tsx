import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    absolute: "BookNook | All Books",
  },
};

export default function BooksLayout({ children }: { children: ReactNode }) {
  return children;
}
