import type { Metadata } from "next";

import "./globals.css";
import { UserProvider } from "./store/global/context/userContext";


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
   

    
      <body
        // className={`${manrope.className} antialiased`}
      >
           <UserProvider>
        {children}
        </UserProvider>
      </body>
        
    </html>
  );
}
