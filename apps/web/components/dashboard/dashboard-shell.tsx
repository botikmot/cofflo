"use client";

import type { ReactNode } from "react";

import { Header } from "./header";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[#F7F3ED] text-[#2B2118]">
      <Header />

      <div className="px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
        <main className="mx-auto max-w-[1500px]">{children}</main>
      </div>
    </div>
  );
}
