'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface GalleryImage {
  url: string;
  caption: string | null;
}

export default function PropertyGallery({ images }: { images: GalleryImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goTo = useCallback((index: number) => {
    if (index < 0) setCurrentIndex(images.length - 1);
    else if (index >= images.length) setCurrentIndex(0);
    else setCurrentIndex(index);
  }, [images.length]);

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isFullscreen, goNext, goPrev]);

  if (!images.length) return null;

  return (
    <>
      <div className="pg-gallery">
        {/* Main image with arrows */}
        <div className="pg-main" onClick={() => setIsFullscreen(true)}>
          <Image
            src={images[currentIndex].url}
            alt={images[currentIndex].caption || `Property image ${currentIndex + 1}`}
            width={900}
            height={560}
            priority={currentIndex === 0}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
          {/* Zoom hint */}
          <div className="pg-zoom-hint">
            <ZoomIn size={16} />
            <span>Click to enlarge</span>
          </div>
          {/* Counter */}
          <div className="pg-counter">
            {currentIndex + 1} / {images.length}
          </div>
          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button
                className="pg-arrow pg-arrow-left"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="Previous image"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                className="pg-arrow pg-arrow-right"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                aria-label="Next image"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="pg-thumbs">
            <div className="pg-thumbs-track">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`pg-thumb ${i === currentIndex ? 'pg-thumb-active' : ''}`}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={img.caption || `Image ${i + 1}`}
                >
                  <Image
                    src={img.url}
                    alt={img.caption || `Thumbnail ${i + 1}`}
                    width={120}
                    height={80}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {isFullscreen && (
        <div className="pg-lightbox" onClick={() => setIsFullscreen(false)}>
          <button
            className="pg-lightbox-close"
            onClick={() => setIsFullscreen(false)}
            aria-label="Close fullscreen"
          >
            <X size={24} />
          </button>

          <div className="pg-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].caption || `Property image ${currentIndex + 1}`}
              width={1400}
              height={900}
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
              priority
            />
          </div>

          {/* Caption */}
          {images[currentIndex].caption && (
            <div className="pg-lightbox-caption">
              {images[currentIndex].caption}
            </div>
          )}

          {/* Counter */}
          <div className="pg-lightbox-counter">
            {currentIndex + 1} / {images.length}
          </div>

          {images.length > 1 && (
            <>
              <button
                className="pg-lightbox-arrow pg-lightbox-arrow-left"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                className="pg-lightbox-arrow pg-lightbox-arrow-right"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        /* ========== Gallery on page ========== */
        .pg-gallery {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
        }

        .pg-main {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          aspect-ratio: 16 / 9;
          cursor: pointer;
          background: var(--bg-secondary);
        }

        .pg-main:hover .pg-zoom-hint {
          opacity: 1;
        }

        .pg-zoom-hint {
          position: absolute;
          top: 14px;
          right: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(8px);
          color: #fff;
          font-size: 0.78rem;
          font-weight: 500;
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }

        .pg-counter {
          position: absolute;
          bottom: 14px;
          right: 14px;
          padding: 5px 12px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(8px);
          color: #fff;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .pg-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(8px);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s, background 0.2s, transform 0.2s;
          z-index: 2;
        }

        .pg-main:hover .pg-arrow {
          opacity: 1;
        }

        .pg-arrow:hover {
          background: rgba(0, 0, 0, 0.7);
          transform: translateY(-50%) scale(1.05);
        }

        .pg-arrow-left { left: 14px; }
        .pg-arrow-right { right: 14px; }

        /* ========== Thumbnails ========== */
        .pg-thumbs {
          margin-top: 0.75rem;
          overflow: hidden;
        }

        .pg-thumbs-track {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .pg-thumbs-track::-webkit-scrollbar {
          height: 4px;
        }
        .pg-thumbs-track::-webkit-scrollbar-thumb {
          background: var(--text-muted);
          border-radius: 2px;
        }

        .pg-thumb {
          flex: 0 0 auto;
          width: 100px;
          height: 68px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid transparent;
          padding: 0;
          cursor: pointer;
          opacity: 0.55;
          transition: opacity 0.2s, border-color 0.2s;
          background: none;
        }

        .pg-thumb:hover {
          opacity: 0.85;
        }

        .pg-thumb-active {
          opacity: 1;
          border-color: var(--accent);
        }

        /* ========== Fullscreen Lightbox ========== */
        .pg-lightbox {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.92);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pgFadeIn 0.2s ease;
        }

        @keyframes pgFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .pg-lightbox-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
          z-index: 3;
        }

        .pg-lightbox-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .pg-lightbox-content {
          max-width: 90vw;
          max-height: 85vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pg-lightbox-caption {
          position: absolute;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
          padding: 8px 20px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          font-size: 0.85rem;
          white-space: nowrap;
        }

        .pg-lightbox-counter {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          padding: 5px 14px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .pg-lightbox-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          z-index: 3;
        }

        .pg-lightbox-arrow:hover {
          background: rgba(255, 255, 255, 0.18);
          transform: translateY(-50%) scale(1.08);
        }

        .pg-lightbox-arrow-left { left: 20px; }
        .pg-lightbox-arrow-right { right: 20px; }

        /* ========== Responsive ========== */
        @media (max-width: 768px) {
          .pg-gallery {
            padding: 0.75rem 1rem;
          }

          .pg-main {
            aspect-ratio: 4 / 3;
            border-radius: 10px;
          }

          .pg-arrow {
            opacity: 1;
            width: 36px;
            height: 36px;
          }

          .pg-arrow-left { left: 8px; }
          .pg-arrow-right { right: 8px; }

          .pg-thumb {
            width: 72px;
            height: 50px;
            border-radius: 6px;
          }

          .pg-lightbox-arrow {
            width: 42px;
            height: 42px;
          }

          .pg-lightbox-arrow-left { left: 8px; }
          .pg-lightbox-arrow-right { right: 8px; }
        }
      `}</style>
    </>
  );
}
