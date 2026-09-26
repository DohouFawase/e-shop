"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** GSAP ne s’exécute que dans le groupe de routes client, jamais dans le dashboard. */
export function StorefrontMotion() {
  const pathname = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const smoother = ScrollSmoother.create({
      wrapper: "#storefront-smooth-wrapper",
      content: "#storefront-smooth-content",
      smooth: 0.65,
      smoothTouch: 0,
      effects: true,
    });

    return () => {
      smoother.kill();
    };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const content = document.querySelector<HTMLElement>("#storefront-smooth-content");
    if (!content) return;

    const context = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>("#storefront-smooth-content main > section");
      sections.forEach((section) => {
        gsap.fromTo(section, { autoAlpha: 0, y: 24 }, {
          autoAlpha: 1, y: 0, duration: 0.65, ease: "power2.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: section, start: "top 90%", once: true },
        });
      });
      const cards = gsap.utils.toArray<HTMLElement>("#storefront-smooth-content main [data-gsap-card]");
      cards.forEach((card) => {
        gsap.fromTo(card, { autoAlpha: 0, y: 18 }, {
          autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: card, start: "top 94%", once: true },
        });
      });
    }, content);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => { window.clearTimeout(refresh); context.revert(); };
  }, [pathname]);

  return null;
}
