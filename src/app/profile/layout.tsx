import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    absolute: "BookNook | My Profile",
  },
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
