"use client";

import { usePathname } from "next/navigation";

const NO_SHELL_ROUTES = ["/activity"];

export function ShellGuard({
  children,
  header,
  footer,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const bare = NO_SHELL_ROUTES.some(r => pathname.startsWith(r));

  if (bare) return <>{children}</>;

  return (
    <div className="siteShell">
      {header}
      <div className="siteMain">{children}</div>
      {footer}
    </div>
  );
}
