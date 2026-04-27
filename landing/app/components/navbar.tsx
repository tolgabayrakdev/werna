"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Özellikler", href: "#ozellikler" },
    { label: "Nasıl Çalışır", href: "#nasil-calisir" },
    { label: "İletişim", href: "#cta" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5">
          <Image src="/werna_logo.svg" alt="Werna" width={28} height={28} />
          <span className="text-lg font-semibold tracking-tight">Werna</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="#"
            className="inline-flex h-10 items-center justify-center rounded-4xl border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Giriş Yap
          </a>
          <a
            href="#"
            className="inline-flex h-10 items-center justify-center rounded-4xl bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Ücretsiz Başla
          </a>
        </div>

        <button
          className="md:hidden inline-flex size-10 items-center justify-center rounded-xl border border-border"
          onClick={() => setOpen(!open)}
          aria-label="Menü"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl px-4 pb-4 pt-2 space-y-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex h-10 items-center rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <a
              href="#"
              className="inline-flex h-10 items-center justify-center rounded-4xl border border-border text-sm font-medium transition-colors hover:bg-muted"
            >
              Giriş Yap
            </a>
            <a
              href="#"
              className="inline-flex h-10 items-center justify-center rounded-4xl bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Ücretsiz Başla
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
