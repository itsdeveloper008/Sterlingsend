/**
 * Vanilla pointer effects (<2 kB gzipped target).
 * Loaded only after idle on fine-pointer devices.
 * Writes CSS variables / transforms via rAF.
 */

type Opts = {
  tiltMax?: number;
  cardTiltMax?: number;
  magneticMax?: number;
};

export function initPointerEffects(root: ParentNode = document, opts: Opts = {}) {
  const tiltMax = opts.tiltMax ?? 6;
  const cardTiltMax = opts.cardTiltMax ?? 4;
  const magneticMax = opts.magneticMax ?? 6;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduce || !fine) return () => undefined;

  const cleanups: Array<() => void> = [];

  function bindTilt(el: HTMLElement, maxDeg: number) {
    let raf = 0;
    function onMove(event: PointerEvent) {
      if (el.contains(document.activeElement)) {
        el.style.transform = "";
        return;
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-y * maxDeg).toFixed(2)}deg) rotateY(${(x * maxDeg).toFixed(2)}deg)`;
      });
    }
    function reset() {
      cancelAnimationFrame(raf);
      el.style.transform = "";
    }
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    el.addEventListener("focusin", reset);
    cleanups.push(() => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
      el.removeEventListener("focusin", reset);
    });
  }

  function bindSpotlight(el: HTMLElement) {
    function onMove(event: PointerEvent) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty(
        "--ss-spot-x",
        `${((event.clientX - rect.left) / rect.width) * 100}%`,
      );
      el.style.setProperty(
        "--ss-spot-y",
        `${((event.clientY - rect.top) / rect.height) * 100}%`,
      );
    }
    el.addEventListener("pointermove", onMove);
    cleanups.push(() => el.removeEventListener("pointermove", onMove));
  }

  function bindMagnetic(el: HTMLElement) {
    let raf = 0;
    function onMove(event: PointerEvent) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        const dist = Math.hypot(x, y);
        const radius = Math.max(rect.width, rect.height);
        if (dist < 0.001 || dist > radius) {
          el.style.transform = "";
          return;
        }
        const force = (1 - dist / radius) * magneticMax;
        el.style.transform = `translate(${(x / dist) * force}px, ${(y / dist) * force}px)`;
      });
    }
    function reset() {
      cancelAnimationFrame(raf);
      el.style.transform = "";
    }
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    cleanups.push(() => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
    });
  }

  root.querySelectorAll<HTMLElement>("[data-ss-tilt='hero']").forEach((el) => {
    bindTilt(el, tiltMax);
  });
  root.querySelectorAll<HTMLElement>("[data-ss-tilt='card']").forEach((el) => {
    bindTilt(el, cardTiltMax);
    bindSpotlight(el);
  });
  root.querySelectorAll<HTMLElement>("[data-ss-magnetic]").forEach((el) => {
    bindMagnetic(el);
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
