import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import ScrollToTop from "@/components/shared/ScrollToTop";
import QueryProvider from "@/components/providers/QueryProvide";
import TransitionProvider from "@/components/providers/TransitionProvider";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invoice Mate",
  description:
    "Easily manage your clients, invoices, and payments in one place.",
  keywords: ["clients", "invoices", "billing", "payments", "management"],
  openGraph: {
    title: "Invoice Mate",
    description:
      "Easily manage your clients, invoices, and payments in one place.",
    type: "website",
    url: "https://yourapp.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoice Mate",
    description:
      "Easily manage your clients, invoices, and payments in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning suppressContentEditableWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TransitionProvider>
              {children}
              <ScrollToTop />
              <Toaster />
            </TransitionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
