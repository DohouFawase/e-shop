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
    let smoother: ReturnType<typeof ScrollSmoother.create> | undefined;
    const timer = window.setTimeout(() => {
      gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      smoother = ScrollSmoother.create({
        wrapper: "#storefront-smooth-wrapper",
        content: "#storefront-smooth-content",
        smooth: 0.65,
        smoothTouch: 0,
        effects: true,
      });
    }, 300);

    return () => {
      window.clearTimeout(timer);
      smoother?.kill();
    };
  }, []);

  useEffect(() => {
    let context: ReturnType<typeof gsap.context> | undefined;
    let refresh: number | undefined;
    const timer = window.setTimeout(() => {
      gsap.registerPlugin(ScrollTrigger);
      const content = document.querySelector<HTMLElement>("#storefront-smooth-content");
      if (!content) return;

      context = gsap.context(() => {
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

      refresh = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    }, 300);

    return () => {
      window.clearTimeout(timer);
      if (refresh !== undefined) window.clearTimeout(refresh);
      context?.revert();
    };
  }, [pathname]);

  return null;
}
