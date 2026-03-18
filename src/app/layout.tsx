import type { ReactNode } from "react";
import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: "LinkVault | Link Building SaaS",
  description:
    "Admin and client-facing SaaS website for managing link building website inventory, prices, and SEO stats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main className="shell page-shell">{children}</main>
      </body>
    </html>
  );
}
