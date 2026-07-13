"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger between siblings (~80ms). */
  delay?: number;
  className?: string;
  as?: ElementType;
};

/**
 * Scroll reveal: opacity 0→1, translateY 24px→0, 600ms.
 * The heavy lifting is CSS ([data-reveal] in globals.css); this just toggles
 * `is-visible` when the element enters the viewport. prefers-reduced-motion is
 * handled in CSS, so reduced-motion users see content immediately.
 */
export function Reveal({ children, delay = 0, className, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref as never}
      data-reveal=""
      className={`${shown ? "is-visible" : ""} ${className ?? ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
