import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";
import { AuroraBg } from "./aurora-bg";

export function AuthShell({ title, subtitle, children, footer }: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AuroraBg />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <Link to="/" className="mb-8 inline-flex"><Logo /></Link>
        <div className="glass-strong rounded-3xl p-8 shadow-glow">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}