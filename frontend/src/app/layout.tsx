import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RWA-GPT",
  description: "AI-powered Real-World Asset conversational agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}