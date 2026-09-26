import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ children, image, imageAlt, caption }: {
  children: ReactNode;
  image: string;
  imageAlt: string;
  caption: string;
}) {
  return (
    <main id="main-content" className="site-container grid min-h-[calc(100vh-100px)] gap-8 py-8 sm:py-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-14">
      <div className="mx-auto w-full max-w-xl py-4 lg:py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-lg font-semibold tracking-[0.17em] text-zinc-950">NAYA<span className="text-[#a45a3d]">.</span></Link>
        <p className="mt-9 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Votre espace personnel</p>
        {children}
      </div>
      <aside className="relative hidden min-h-[620px] overflow-hidden bg-[#f4f1ec] lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={imageAlt} className="absolute inset-0 size-full object-contain p-12 xl:p-16" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1b211b]/80 via-[#1b211b]/35 to-transparent px-10 pb-10 pt-32 text-white xl:px-14 xl:pb-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">Naya · Côte d’Ivoire</p>
          <p className="mt-3 max-w-md font-serif text-3xl leading-tight">{caption}</p>
        </div>
        <span aria-hidden="true" className="absolute right-8 top-8 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-700">Des choix qui vous ressemblent</span>
      </aside>
    </main>
  );
}
