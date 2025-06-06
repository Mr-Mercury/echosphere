import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/components/providers/modal-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { QueryProvider } from "@/components/providers/query-provider";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Echosphere",
  description: "A rich LLM comparison tool that can also create bots that chat with you and each other",
  keywords: ["LLM", "AI", "Chat", "Bots", "Echosphere", "Echosphere AI", "Echosphere Chat", "Echosphere Bots"],
};

//TODO: Determine if this should be inside chat instead?  Should be a minor effect...
// no need to preserve state from chat app in future analytical page?  Next cache should 
// work instead of state...?
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#313338]">
      <body className={`${inter.className} bg-[#313338] min-h-screen`}>
        <SocketProvider>
          <ModalProvider />
          <QueryProvider>
            {children}
          </QueryProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
