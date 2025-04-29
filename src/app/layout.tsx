import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rehabilitasyon Merkezi",
  description: "Rehabilitasyon hizmetleri sunan merkez",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <div style={{ paddingTop: '80px' }}>
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
