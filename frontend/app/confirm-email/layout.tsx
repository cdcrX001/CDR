"use client"

import { ReactNode } from "react";

export default function ConfirmEmailLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main>{children}</main>
    </div>
  );
}
