import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "../globals.css";
import DashboardShell from "../components/core/dashboard-shell";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const manrope = Manrope({
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "Integrion",
  description: "The next-gen AI plaform for QA and backend testing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} antialiased`}>
         <DashboardShell>
          {children}
        </DashboardShell>
      </body>
    </html>
  );
}
