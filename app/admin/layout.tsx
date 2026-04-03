"use client";
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
    <>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <nav style={{ width: "210px", backgroundColor: "#C97B5A", display: "flex", flexDirection: "column", padding: "2rem 1.25rem", flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "130px", height: "130px", borderRadius: "50%", border: "0.5px solid rgba(255,255,255,0.12)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "40px", left: "-30px", width: "90px", height: "90px", borderRadius: "50%", border: "0.5px solid rgba(255,255,255,0.1)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1, marginBottom: "2.5rem" }}>
            <div style={{ width: "20px", height: "0.5px", background: "rgba(255,255,255,0.5)", marginBottom: "1rem" }} />
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontWeight: 400, fontSize: "28px", letterSpacing: "0.05em", color: "#FFFFFF", lineHeight: 1, margin: "0 0 2px 0" }}>somma</h1>
            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 400, fontSize: "8px", letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", margin: "0 0 1rem 0" }}>studio</p>
            <div style={{ width: "20px", height: "0.5px", background: "rgba(255,255,255,0.4)" }} />
          </div>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "0.75rem", position: "relative", zIndex: 1 }}>Panel interno</p>
          <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
            {navItems.map(item => {
              const active = path === item.href || path.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", padding: "8px 10px", borderRadius: "6px", marginBottom: "2px", fontSize: "12px", letterSpacing: "0.03em", textDecoration: "none", fontFamily: "'Jost', sans-serif", fontWeight: active ? 400 : 300, color: active ? "#FFFFFF" : "rgba(255,255,255,0.6)", background: active ? "rgba(255,255,255,0.18)" : "transparent", transition: "all 0.15s" }}>
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div style={{ position: "relative", zIndex: 1, borderTop: "0.5px solid rgba(255,255,255,0.2)", paddingTop: "12px" }}>
            <Link href="/register" target="_blank" style={{ display: "block", padding: "6px 10px", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "'Jost', sans-serif" }}>↗ Ver landing</Link>
          </div>
        </nav>
        <main style={{ flex: 1, background: "#F5F4F1", overflow: "auto", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
          {children}
        </main>
      </div>
    </>
  );
}
