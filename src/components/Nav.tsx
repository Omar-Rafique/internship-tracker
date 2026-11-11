"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Board" },
  { href: "/stats/", label: "Stats" },
];

export default function Nav() {
  const pathname = usePathname() ?? "/";
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, ""));

  return (
    <header className="nav">
      <Link href="/" className="brand">
        🎯 Internship Tracker
      </Link>
      <nav aria-label="Main">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={isActive(l.href) ? "nav-link active" : "nav-link"}
            aria-current={isActive(l.href) ? "page" : undefined}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
