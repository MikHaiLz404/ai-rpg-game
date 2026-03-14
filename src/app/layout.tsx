import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gods' Arena",
  description: "Shop Management + Turn-Based RPG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
