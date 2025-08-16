import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HR Chatbot Demo",
  description:
    "AI-powered HR assistant for company policies and leave requests",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
