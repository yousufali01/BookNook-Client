import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    absolute: "BookNook | My Books",
  },
};

export default function MyBooksLayout({ children }: { children: ReactNode }) {
  return children;
}
