"use client";

import { useState } from "react";
import Image from "next/image";

export type ColorOption = {
  id: string;
  label: string;
  swatch: string;
  images: { src: string; alt: string }[];
};

export const SONIC_COLORS: ColorOption[] = [
  {
    id: "black",
    label: "Black",
    swatch: "#1a1a1a",
    images: [
      { src: "/sonic_black_without_food.webp", alt: "ARGO Sonic robot in black" },
      { src: "/sonic_black.webp", alt: "ARGO Sonic robot in black carrying food" },
    ],
  },
  {
    id: "white",
    label: "White",
    swatch: "#f5f5f5",
    images: [
      { src: "/sonic_white_without_food.webp", alt: "ARGO Sonic robot in white" },
      { src: "/sonic_with_food.webp", alt: "ARGO Sonic robot in white carrying food" },
    ],
  },
  {
    id: "silver",
    label: "Silver",
    swatch: "#c7c9cc",
    images: [
      { src: "/sonic_silver_without_food.webp", alt: "ARGO Sonic robot in silver" },
      { src: "/argo_sonic_silver.webp", alt: "ARGO Sonic robot in silver carrying food" },
    ],
  },
];

export function OrderGallery({ colors }: { colors: ColorOption[] }) {
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
      <div className="orderMediaFrame">
        <Image
          key={activeImage.src}
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          sizes="(max-width: 900px) 100vw, 42vw"
          style={{ objectFit: "cover" }}
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
