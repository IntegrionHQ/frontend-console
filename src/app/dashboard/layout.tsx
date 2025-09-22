import type { Metadata } from "next";
import DashboardShell from "../components/core/dashboard-shell";


export const metadata: Metadata = {
  title: "Integrion",
  description: "The next-gen AI platform for QA and backend testing",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
