"use client";

import { useState } from "react";
import Image from "next/image";

export type ColorOption = {
  id: string;
  label: string;
  swatch: string;
  images: { src: string; alt: string; width: number; height: number }[];
};

export const SONIC_COLORS: ColorOption[] = [
  {
    id: "sonic",
    label: "Argo Sonic",
    swatch: "#c9a962",
    images: [
      { src: "/argo_sonic.webp", alt: "Argo Sonic autonomous hospitality robot", width: 418, height: 597 },
    ],
  },
];

export function OrderGallery({
  colors,
  layout = "slider",
}: {
  colors: ColorOption[];
  layout?: "slider" | "stack";
}) {
  const [colorIndex, setColorIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  const color = colors[colorIndex];
  const images = color.images;
  const activeImage = images[imageIndex];

  const handleColorSelect = (index: number) => {
    setColorIndex(index);
    setImageIndex(0);
  };

  const showPrev = () => setImageIndex((i) => (i - 1 + images.length) % images.length);
  const showNext = () => setImageIndex((i) => (i + 1) % images.length);

  return (
    <div className="orderGallery">
      {layout === "stack" ? (
        <div className="orderMediaStack">
          {images.map((img) => (
            <div key={img.src} className="orderMediaFrame">
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(max-width: 900px) 100vw, 42vw"
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: "1.5rem" }}
                priority
              />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="orderMediaFrame">
            <Image
              key={activeImage.src}
              src={activeImage.src}
              alt={activeImage.alt}
              width={activeImage.width}
              height={activeImage.height}
              sizes="(max-width: 900px) 100vw, 42vw"
              style={{ width: "100%", height: "100%", objectFit: "contain", padding: "1.5rem" }}
              priority
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="orderNavBtn orderNavBtn--prev"
                  aria-label="Previous photo"
                  onClick={showPrev}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="orderNavBtn orderNavBtn--next"
                  aria-label="Next photo"
                  onClick={showNext}
                >
                  ›
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="orderDots" role="tablist" aria-label="Product photos">
              {images.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  className="orderDot"
                  data-active={i === imageIndex}
                  aria-label={`Show photo ${i + 1}`}
                  aria-selected={i === imageIndex}
                  onClick={() => setImageIndex(i)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {colors.length > 1 && (
        <div className="orderColors">
          <span className="orderColors__label">Color</span>
          <div className="orderColors__row">
            {colors.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className="orderColorSwatch"
                data-active={i === colorIndex}
                style={{ background: c.swatch }}
                aria-label={c.label}
                aria-pressed={i === colorIndex}
                title={c.label}
                onClick={() => handleColorSelect(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
