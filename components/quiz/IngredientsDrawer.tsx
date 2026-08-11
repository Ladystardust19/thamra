"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DRAWER_GROUPS, DRAWER_TITLE, type Ingredient } from "@/lib/thamraFormula";

function Thumb({ ing }: { ing: Ingredient }) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-surface">
      {ing.image ? (
        <Image src={ing.image} alt={ing.name} fill sizes="56px" className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-display text-lg font-light text-gold/50">
          T
        </span>
      )}
    </div>
  );
}

function Row({ ing }: { ing: Ingredient }) {
  return (
    <div className="flex items-start gap-4 border-b border-hairline py-4">
      <Thumb ing={ing} />
      <div className="min-w-0">
        <p className="font-body text-sm font-semibold text-oxblood">{ing.name}</p>
        <p className="mt-1 font-body text-[13px] font-light leading-relaxed text-read">
          {ing.description}
        </p>
      </div>
    </div>
  );
}

export default function IngredientsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();

  // Lock body scroll, trap focus, restore on close.
  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      prevFocus.current?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <div
            className="absolute inset-0 bg-ink/40"
            aria-hidden
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={DRAWER_TITLE}
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-cream shadow-xl"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
            transition={{ type: "tween", duration: reduce ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
              <h2 className="font-display text-xl font-light text-oxblood">{DRAWER_TITLE}</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="დახურვა"
                className="ml-4 shrink-0 rounded-full p-1.5 text-muted transition-colors hover:bg-surface hover:text-ink"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-10">
              {DRAWER_GROUPS.map((group) => (
                <section key={group.id} className="mt-7">
                  <h3 className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-gold">
                    {group.title}
                  </h3>
                  <p className="mt-1.5 font-body text-[13px] font-light leading-relaxed text-muted">
                    {group.intro}
                  </p>
                  <div className="mt-2">
                    {group.ingredients.map((ing) => (
                      <Row key={ing.name} ing={ing} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
