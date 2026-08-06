'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsImageGridProps {
  imageUrls?: string[];
  imageUrl?: string;
  title: string;
  className?: string;
  interactive?: boolean;
}

export function NewsImageGrid({
  imageUrls,
  imageUrl,
  title,
  className,
  interactive = true,
}: NewsImageGridProps) {
  // Combine imageUrls and single imageUrl into clean array
  const images = React.useMemo(() => {
    if (imageUrls && imageUrls.length > 0) {
      return imageUrls.filter(Boolean);
    }
    if (imageUrl) {
      return [imageUrl];
    }
    return [];
  }, [imageUrls, imageUrl]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return null;
  }

  const getOptimizedUrl = (url: string, width = 800) => {
    if (!url.includes('res.cloudinary.com')) return url;
    return url.replace('/image/upload/', `/image/upload/w_${width},q_auto,f_auto/`);
  };

  const handleImageClick = (e: React.MouseEvent, index: number) => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();
    setLightboxIndex(index);
  };

  const nextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % images.length);
  };

  const prevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
  };

  const count = images.length;

  return (
    <div className={cn('w-full select-none', className)}>
      {/* 1 FOTO (Landscape Utama) */}
      {count === 1 && (
        <div
          onClick={(e) => handleImageClick(e, 0)}
          className={cn(
            'group relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 shadow-sm',
            interactive && 'cursor-pointer'
          )}
        >
          <img
            src={getOptimizedUrl(images[0], 1200)}
            alt={`${title} - Foto 1`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {interactive && (
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 flex items-center justify-center">
              <Maximize2 className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100 drop-shadow-md" />
            </div>
          )}
        </div>
      )}

      {/* 2 FOTO (Side-by-Side Grid) */}
      {count === 2 && (
        <div className="grid grid-cols-2 gap-2 aspect-[16/10] w-full">
          {images.map((img, idx) => (
            <div
              key={idx}
              onClick={(e) => handleImageClick(e, idx)}
              className={cn(
                'group relative h-full w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 shadow-sm',
                interactive && 'cursor-pointer'
              )}
            >
              <img
                src={getOptimizedUrl(img, 800)}
                alt={`${title} - Foto ${idx + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {interactive && (
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 flex items-center justify-center">
                  <Maximize2 className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100 drop-shadow-md" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3 FOTO (Landscape & 2 Kecil) */}
      {count === 3 && (
        <div className="flex flex-col gap-2 w-full">
          {/* Main Top Landscape Photo */}
          <div
            onClick={(e) => handleImageClick(e, 0)}
            className={cn(
              'group relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 shadow-sm',
              interactive && 'cursor-pointer'
            )}
          >
            <img
              src={getOptimizedUrl(images[0], 1200)}
              alt={`${title} - Foto Utama`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {interactive && (
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 flex items-center justify-center">
                <Maximize2 className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100 drop-shadow-md" />
              </div>
            )}
          </div>
          {/* 2 Small Photos Side-by-Side Below */}
          <div className="grid grid-cols-2 gap-2 aspect-[16/7] w-full">
            {images.slice(1, 3).map((img, idx) => {
              const actualIdx = idx + 1;
              return (
                <div
                  key={actualIdx}
                  onClick={(e) => handleImageClick(e, actualIdx)}
                  className={cn(
                    'group relative h-full w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 shadow-sm',
                    interactive && 'cursor-pointer'
                  )}
                >
                  <img
                    src={getOptimizedUrl(img, 600)}
                    alt={`${title} - Foto ${actualIdx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {interactive && (
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 flex items-center justify-center">
                      <Maximize2 className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100 drop-shadow-md" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4 FOTO & LEBIH (Landscape & 3 Kecil) */}
      {count >= 4 && (
        <div className="flex flex-col gap-2 w-full">
          {/* Main Top Landscape Photo */}
          <div
            onClick={(e) => handleImageClick(e, 0)}
            className={cn(
              'group relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 shadow-sm',
              interactive && 'cursor-pointer'
            )}
          >
            <img
              src={getOptimizedUrl(images[0], 1200)}
              alt={`${title} - Foto Utama`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {interactive && (
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 flex items-center justify-center">
                <Maximize2 className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100 drop-shadow-md" />
              </div>
            )}
          </div>

          {/* 3 Small Photos Side-by-Side Below */}
          <div className="grid grid-cols-3 gap-2 aspect-[16/6] w-full">
            {images.slice(1, 4).map((img, idx) => {
              const actualIdx = idx + 1;
              const isThirdSmall = idx === 2;
              const remainingCount = count - 4;

              return (
                <div
                  key={actualIdx}
                  onClick={(e) => handleImageClick(e, actualIdx)}
                  className={cn(
                    'group relative h-full w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 shadow-sm',
                    interactive && 'cursor-pointer'
                  )}
                >
                  <img
                    src={getOptimizedUrl(img, 600)}
                    alt={`${title} - Foto ${actualIdx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {isThirdSmall && remainingCount > 0 ? (
                    <div className="absolute inset-0 bg-slate-950/65 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                      <span className="text-lg font-black tracking-wider">+{remainingCount + 1}</span>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-slate-300">Foto</span>
                    </div>
                  ) : (
                    interactive && (
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 flex items-center justify-center">
                        <Maximize2 className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100 drop-shadow-md" />
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIGHTBOX DIALOG MODAL FOR INTERACTIVE VIEWING */}
      {interactive && (
        <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && setLightboxIndex(null)}>
          <DialogContent className="max-w-5xl bg-slate-950/95 border-none text-white p-0 overflow-hidden sm:rounded-3xl">
            <DialogTitle className="sr-only">{title} Gallery</DialogTitle>
            {lightboxIndex !== null && (
              <div className="relative flex flex-col items-center justify-center min-h-[500px] max-h-[85vh] p-4">
                <img
                  src={images[lightboxIndex]}
                  alt={`${title} - Gallery ${lightboxIndex + 1}`}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                <div className="mt-4 flex items-center justify-between w-full px-6 text-xs text-slate-400 font-medium">
                  <span className="line-clamp-1">{title}</span>
                  <span className="font-bold tracking-widest text-sky-400">
                    {lightboxIndex + 1} / {images.length}
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
