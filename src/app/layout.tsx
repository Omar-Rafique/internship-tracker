import type { Metadata } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Internship Tracker",
  description: "Track internship and job applications from wishlist to offer.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="container">{children}</main>
        <footer className="footer">
          Built with Next.js · Data stays in your browser (localStorage)
        </footer>
      </body>
    </html>
  );
}
