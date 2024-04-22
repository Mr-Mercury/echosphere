import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/jotai/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Echosphere",
  description: "A rich LLM comparison tool that can also create bots that chat with you and each other",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
        {children}
        </Providers>
      </body>
    </html>
  );
}
