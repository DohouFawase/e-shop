export function StorefrontLoadingScreen({
  label = "Chargement de la boutique…",
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="fixed inset-0 z-[100] grid place-items-center bg-white/95 px-6 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center text-center">
        <span className="relative grid size-14 place-items-center" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border border-zinc-900/10" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 motion-reduce:animate-none border-transparent border-t-zinc-950" />
          <span className="size-2 rounded-full bg-amber-700" />
        </span>
        <span className="mt-5 font-serif text-xl tracking-wide text-zinc-950">Naya</span>
        <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          {label}
        </span>
      </div>
    </div>
  );
}
