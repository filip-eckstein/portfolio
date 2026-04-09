import { useEffect } from "react";

/**
 * Observes elements matching `selector` in the document and adds
 * the CSS class `revealed` once they enter the viewport.
 *
 * Uses a debounced MutationObserver to also watch for async-loaded elements
 * without causing layout thrashing/jank.
 */
export function useScrollReveal(
  selector: string = ".reveal",
  options: IntersectionObserverInit = { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
) {
  useEffect(() => {
    const observed = new Set<Element>();

    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          intersectionObserver.unobserve(entry.target);
        }
      });
    }, options);

    const observe = (el: Element) => {
      if (!observed.has(el) && !el.classList.contains("revealed")) {
        observed.add(el);
        intersectionObserver.observe(el);
      }
    };

    // Initial pass
    document.querySelectorAll<Element>(selector).forEach(observe);

    // Debounced mutation callback — batches DOM changes via rAF
    let rafId: number | null = null;
    const mutationObserver = new MutationObserver(() => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        document.querySelectorAll<Element>(selector).forEach(observe);
        rafId = null;
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector]);
}

