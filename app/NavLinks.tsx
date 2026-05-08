"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/",                    label: "Search",     match: "/" },
  { href: "/?type=consumer",      label: "Consumer",   match: "/consumer" },
  { href: "/?type=enterprise",    label: "Enterprise", match: "/enterprise" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 text-sm">
      {NAV.map(({ href, label, match }) => {
        const active =
          match === "/" ? pathname === "/"
          : pathname.startsWith(match);
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-md transition ${
              active ? "bg-zinc-800 text-white" : "hover:bg-zinc-800 text-zinc-300"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
