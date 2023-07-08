import AdminAuthProvider from "@/contexts/admin-auth";
import "./globals.css";
import { Inter } from "next/font/google";
import BskyAgentContextProvider from "@/contexts/bsty-agent";
import AdminAuthModal from "@/components/functional/admin-auth-modal";
import { Drawer } from "@/components/ui/drawer";
import { Mailbox } from "lucide-react";

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
  const navItems = [
    {
      icon: <Mailbox />,
      text: "getModarationReports",
      path: "/",
    },
  ];

  return (
    <html lang="en">
      <body className={inter.className}>
        <BskyAgentContextProvider>
          <AdminAuthProvider>
            <>
              <AdminAuthModal />
              <main className="flex flex-row flex-nowrap">
                <Drawer items={navItems} className="flex-none" />
                <div className="grow">{children}</div>
              </main>
            </>
          </AdminAuthProvider>
        </BskyAgentContextProvider>
      </body>
    </html>
  );
}
