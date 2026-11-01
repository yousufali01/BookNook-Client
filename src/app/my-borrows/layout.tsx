import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    absolute: "BookNook | My Borrows",
  },
};

export default function MyBorrowsLayout({ children }: { children: ReactNode }) {
  return children;
}
