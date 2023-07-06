import AdminAuthProvider from "@/contexts/admin-auth";
import "./globals.css";
import { Inter } from "next/font/google";
import BskyAgentContextProvider from "@/contexts/bsty-agent";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ATProtocol PDS Dashboard",
  description: "PDS management dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BskyAgentContextProvider>
      <AdminAuthProvider>
        <html lang="en">
          <body className={inter.className}>{children}</body>
        </html>
      </AdminAuthProvider>
    </BskyAgentContextProvider>
  );
}
