import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creek's Girls Lacrosse",
  description: "Official site of the Creek's Girls Lacrosse team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
