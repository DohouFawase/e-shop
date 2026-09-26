import { gsap } from "gsap";

export function animateProductToCart(source: HTMLImageElement | null): void {
  const target = document.querySelector<HTMLElement>("[data-cart-target]");
  if (!source || !target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const sourceBounds = source.getBoundingClientRect();
  const targetBounds = target.getBoundingClientRect();
  if (sourceBounds.width === 0 || sourceBounds.height === 0) return;

  const flight = source.cloneNode(false) as HTMLImageElement;
  flight.alt = "";
  flight.setAttribute("aria-hidden", "true");
  Object.assign(flight.style, {
    position: "fixed",
    top: `${sourceBounds.top}px`,
    left: `${sourceBounds.left}px`,
    width: `${sourceBounds.width}px`,
    height: `${sourceBounds.height}px`,
    objectFit: "cover",
    borderRadius: "4px",
    pointerEvents: "none",
    zIndex: "1000",
    transformOrigin: "center center",
    willChange: "transform, opacity",
  });
  document.body.append(flight);

  gsap.to(flight, {
    x: targetBounds.left + targetBounds.width / 2 - (sourceBounds.left + sourceBounds.width / 2),
    y: targetBounds.top + targetBounds.height / 2 - (sourceBounds.top + sourceBounds.height / 2),
    scaleX: Math.min(0.18, targetBounds.width / sourceBounds.width),
    scaleY: Math.min(0.18, targetBounds.height / sourceBounds.height),
    rotate: 10,
    opacity: 0.75,
    duration: 0.7,
    ease: "power2.inOut",
    onComplete: () => {
      flight.remove();
      gsap.fromTo(
        target,
        { scale: 1 },
        { scale: 1.18, duration: 0.14, repeat: 1, yoyo: true, ease: "power1.out" },
      );
    },
  });
}
