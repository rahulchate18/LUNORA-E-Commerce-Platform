/**
 * components/product/product-gallery.tsx — Interactive product image gallery
 *
 * Client Component that allows thumbnail switching, loading skeletons, and hover zoom.
 */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: Array<string | ProductImage>;
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMainLoading, setIsMainLoading] = useState(true);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // Reset loading state on active index change
  useEffect(() => {
    setIsMainLoading(true);
  }, [activeIndex]);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse">
        <span className="text-sm text-neutral-400">No Image Available</span>
      </div>
    );
  }

  const getImgSrc = (img: string | ProductImage, type: "thumbnail" | "medium" | "large" | "original") => {
    if (typeof img === "string") return img;
    if (type === "thumbnail") return img.thumbnail || img.secure_url || img.url;
    if (type === "medium") return img.medium || img.secure_url || img.url;
    if (type === "large") return img.large || img.secure_url || img.url;
    return img.original || img.secure_url || img.url;
  };

  const currentImg = images[activeIndex];
  const mainSrc = getImgSrc(currentImg, "large");
  const zoomSrc = getImgSrc(currentImg, "original");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row lg:items-start">
      {/* Thumbnails (Horizontal on mobile, vertical on larger screens) */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none lg:flex-col lg:overflow-x-visible lg:pb-0 lg:max-h-[500px]">
        {images.map((img, index) => {
          const thumbSrc = getImgSrc(img, "thumbnail");
          const altText = typeof img === "string" ? `${name} thumbnail ${index + 1}` : img.alt || `${name} thumbnail ${index + 1}`;
          return (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-square w-16 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-neutral-50 transition-all focus:outline-hidden",
                activeIndex === index
                  ? "border-neutral-900 ring-2 ring-neutral-900/10 dark:border-white dark:ring-white/20"
                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={thumbSrc}
                alt={altText}
                fill
                sizes="80px"
                loading="lazy"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* Main Image Container */}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        {/* Loading skeleton */}
        {isMainLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
            {/* Shimmer skeleton */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-950 dark:border-neutral-700 dark:border-t-white" />
          </div>
        )}

        {/* Main Display Image */}
        <div
          className="relative w-full h-full cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
        >
          <Image
            src={mainSrc}
            alt={typeof currentImg === "string" ? name : currentImg.alt || name}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            priority={activeIndex === 0}
            onLoad={() => setIsMainLoading(false)}
            className={cn(
              "object-cover transition-transform duration-200 ease-out",
              isZooming ? "scale-150" : "scale-100"
            )}
            style={
              isZooming
                ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
