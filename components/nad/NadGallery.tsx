"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type TouchEvent, type UIEvent } from "react";

const PHOTOS = [
  {
    src: "/hair-cell-nad/hero-packaging.webp",
    alt: "THAMRA HAIR CELL NAD+ გახსნილ შინდისფერ ყუთში",
  },
  {
    src: "/hair-cell-nad/hero-sachets.webp",
    alt: "THAMRA HAIR CELL NAD+-ის შინდისფერი პაკეტები ოქროსფერი წარწერებით",
  },
  {
    src: "/hair-cell-nad/hero-berry-drink.webp",
    alt: "THAMRA HAIR CELL NAD+-ის პაკეტი კენკრის სასმელის ბოთლთან და ჭიქასთან",
  },
];

const SIZES = "(min-width: 1280px) 564px, (min-width: 1024px) calc(50vw - 76px), 100vw";
const ARROW_CLASS = "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-paper/95 text-oxblood-dark shadow-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood disabled:opacity-50 motion-reduce:transition-none";

export default function NadGallery() {
  const track = useRef<HTMLDivElement>(null);
  const touchStart = useRef(0);
  const [active, setActive] = useState(0);

  function showPhoto(index: number) {
    const viewport = track.current;
    if (!viewport || index < 0 || index >= PHOTOS.length) return;
    viewport.scrollTo({ left: viewport.clientWidth * index });
  }

  function updateActive(event: UIEvent<HTMLDivElement>) {
    const { scrollLeft, clientWidth } = event.currentTarget;
    if (!clientWidth) return;
    const index = Math.round(scrollLeft / clientWidth);
    setActive(Math.min(PHOTOS.length - 1, Math.max(0, index)));
  }

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    showPhoto(active + (event.key === "ArrowRight" ? 1 : -1));
  }

  function finishSwipe(event: TouchEvent<HTMLDivElement>) {
    const { scrollLeft, clientWidth } = event.currentTarget;
    const distance = scrollLeft - touchStart.current;
    if (!clientWidth || Math.abs(distance) < 1) return;
    const start = Math.round(touchStart.current / clientWidth);
    const step = Math.abs(distance) >= Math.min(56, clientWidth * 0.15) ? Math.sign(distance) : 0;
    const next = Math.min(PHOTOS.length - 1, Math.max(0, start + step));
    showPhoto(next);
  }

  return (
    <section aria-label="პროდუქტის ფოტოები" className="relative min-w-0">
      <div
        ref={track}
        role="group"
        aria-label="ფოტოების გადასართავად გამოიყენე მარცხენა და მარჯვენა ისრები"
        tabIndex={0}
        onScroll={updateActive}
        onKeyDown={handleKeys}
        onTouchStart={(event) => { touchStart.current = event.currentTarget.scrollLeft; }}
        onTouchEnd={finishSwipe}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-oxblood motion-reduce:scroll-auto lg:rounded-[1.5rem] [&::-webkit-scrollbar]:hidden"
      >
        {PHOTOS.map((photo, index) => (
          <div
            key={photo.src}
            aria-hidden={index !== active}
            className="relative aspect-[1122/1402] w-full shrink-0 snap-start snap-always bg-surface"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              priority={index === 0}
              quality={index === 0 ? undefined : 94}
              sizes={SIZES}
              draggable={false}
              className="object-contain"
            />
          </div>
        ))}
      </div>

      <button type="button" aria-label="წინა ფოტო" disabled={active === 0} onClick={() => showPhoto(active - 1)} className={`${ARROW_CLASS} left-3 sm:left-4`}>
        <ChevronLeft aria-hidden size={19} strokeWidth={1.6} />
      </button>
      <div className="flex justify-center pt-1">
        {PHOTOS.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            aria-label={`ფოტო ${index + 1}`}
            aria-current={index === active ? "true" : undefined}
            onClick={() => showPhoto(index)}
            className="group flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-oxblood"
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-oxblood/30 transition-[width,background-color] group-hover:bg-oxblood group-aria-[current=true]:w-5 group-aria-[current=true]:bg-oxblood-dark motion-reduce:transition-none" />
          </button>
        ))}
      </div>
      <button type="button" aria-label="შემდეგი ფოტო" disabled={active === PHOTOS.length - 1} onClick={() => showPhoto(active + 1)} className={`${ARROW_CLASS} right-3 sm:right-4`}>
        <ChevronRight aria-hidden size={19} strokeWidth={1.6} />
      </button>
      <p className="sr-only" aria-live="polite" aria-atomic="true">ფოტო {active + 1} / {PHOTOS.length}</p>
    </section>
  );
}
