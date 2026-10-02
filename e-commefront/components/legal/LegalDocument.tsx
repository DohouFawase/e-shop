import type { ReactNode } from "react";
import Link from "next/link";

export function LegalDocument({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <main
      id="main-content"
      className="site-container min-h-[60vh] max-w-4xl pb-20 pt-10 sm:pt-14"
    >
      <nav aria-label="Fil d’Ariane" className="mb-8 text-xs text-zinc-500">
        <Link href="/" className="hover:text-zinc-950">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">{title}</span>
      </nav>
   
      <header className="mb-10 border-b border-zinc-900/10 pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Naya · Informations légales
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-zinc-950 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-600">
          {summary}
        </p>
        <p className="mt-4 text-xs text-zinc-500">
          Version de travail — 27 septembre 2026
        </p>
      </header>
      <div className="space-y-8 text-sm leading-7 text-zinc-700">
        {children}
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 font-serif text-2xl text-zinc-950">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
