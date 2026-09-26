"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StorefrontLoadingScreen } from "@/components/shop/StorefrontLoadingScreen";

export function StorefrontNavigationLoader() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setPending(true), 120);
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return pending ? <StorefrontLoadingScreen label="Ouverture de la page…" /> : null;
}
