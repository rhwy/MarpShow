"use client";

import { Home, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export interface TopBarProps {
  /** Override nav items for testing or customization */
  navItems?: NavItem[];
}

export function TopBar({ navItems = NAV_ITEMS }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className="flex items-center justify-between h-12 px-4 border-b"
      style={{
        backgroundColor: "var(--surface-primary)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="flex items-center gap-3">
        {!isHome && (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: "var(--fg-muted)" }}
            aria-label="Go back"
            title="Go back"
            data-testid="topbar-back-btn"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <Link
          href="/"
          className="text-base font-bold"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--fg-primary)",
            textDecoration: "none",
          }}
        >
          MarkShow
        </Link>
      </div>

      <nav className="flex items-center gap-5" role="navigation" aria-label="Main navigation">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            title={label}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{
              color: isActive(href)
                ? "var(--accent-primary)"
                : "var(--fg-muted)",
            }}
          >
            <Icon size={20} />
          </Link>
        ))}
      </nav>
    </header>
  );
}
