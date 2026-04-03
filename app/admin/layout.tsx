"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/alumnas",   label: "Alumnas" },
  { href: "/admin/clases",    label: "Clases" },
  { href: "/admin/planes",    label: "Planes" },
  { href: "/admin/coaches",   label: "Coaches" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
      <nav style={{ width: "200px", background: "#1E1C19", display: "flex", flexDirection: "column", padding: "1.5rem 1rem", flexShrink: 0 }}>
        <div style={{ padding: "0 0.5rem", marginBottom: "1.5rem" }}>
          <Image src="/logo.png" alt="Somma Studio" width={90} height={90} style={{ objectFit: "contain" }} />
        </div>
        <p style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(201,123,90,0.7)", padding: "0 0.75rem", marginBottom: "1rem" }}>Panel interno</p>
        {navItems.map(item => (
          <Link key={item.href} href={item.href} style={{
            display: "block", padding: "8px 12px", borderRadius: "6px", marginBottom: "2px",
            fontSize: "13px", letterSpacing: "0.03em", textDecoration: "none", transition: "all 0.15s",
            color: path === item.href ? "#C97B5A" : "rgba(245,240,232,0.55)",
            background: path === item.href ? "rgba(201,123,90,0.12)" : "transparent",
          }}>
            {item.label}
          </Link>
        ))}
        <div style={{ marginTop: "auto", borderTop: "0.5px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
          <Link href="/register" style={{ display: "block", padding: "8px 12px", fontSize: "11px", color: "rgba(245,240,232,0.35)", textDecoration: "none", letterSpacing: "0.05em" }}>
            ← Ver landing
          </Link>
        </div>
      </nav>
      <main style={{ flex: 1, background: "#F5F4F1", overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}
