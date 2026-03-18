import Link from "next/link";

const navigation = [
  { href: "/", label: "Overview" },
  { href: "/marketplace", label: "Client Marketplace" },
  { href: "/admin", label: "Admin Dashboard" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell nav-shell">
        <Link className="brand" href="/">
          <span className="brand-mark">LV</span>
          <div>
            <p>LinkVault</p>
            <span>Link building SaaS platform</span>
          </div>
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
