import AdminAuthProvider from "@/contexts/admin-auth";
import "./globals.css";
import { Inter } from "next/font/google";
import BskyAgentContextProvider from "@/contexts/bsty-agent";
import AdminAuthModal from "@/components/functional/admin-auth-modal";

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
    <html lang="en">
      <body className={inter.className}>
        <BskyAgentContextProvider>
          <AdminAuthProvider>
            <>
              <AdminAuthModal />
              {children}
            </>
          </AdminAuthProvider>
        </BskyAgentContextProvider>
      </body>
    </html>
  );
}
