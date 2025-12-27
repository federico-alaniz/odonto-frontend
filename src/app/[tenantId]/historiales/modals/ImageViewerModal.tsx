'use client';

import { useState } from 'react';
import Image from 'next/image';
import Portal from '../../calendario/components/Portal';

interface DiagnosticImage {
  id: string;
  name: string;
  description?: string;
  type: 'radiografia' | 'ecografia' | 'tomografia' | 'resonancia' | 'endoscopia' | 'laboratorio' | 'otro';
  url: string;
  uploadDate: string;
}

interface ImageViewerModalProps {
  images: DiagnosticImage[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageViewerModal({ images, initialIndex, isOpen, onClose }: ImageViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen || !images.length) return null;

  const currentImage = images[currentIndex];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'radiografia': 'Radiografía',
      'ecografia': 'Ecografía',
      'tomografia': 'Tomografía',
      'resonancia': 'Resonancia Magnética',
      'endoscopia': 'Endoscopia',
      'laboratorio': 'Laboratorio',
      'otro': 'Otro'
    };
    return labels[type] || type;
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60]">
        <div className="max-w-6xl max-h-full w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 text-white">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold">{currentImage.name}</h2>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                currentImage.type === 'radiografia' ? 'bg-blue-600 text-blue-100' :
                currentImage.type === 'ecografia' ? 'bg-green-600 text-green-100' :
                currentImage.type === 'tomografia' ? 'bg-purple-600 text-purple-100' :
                currentImage.type === 'resonancia' ? 'bg-red-600 text-red-100' :
                currentImage.type === 'endoscopia' ? 'bg-yellow-600 text-yellow-100' :
                currentImage.type === 'laboratorio' ? 'bg-indigo-600 text-indigo-100' :
                'bg-gray-600 text-gray-100'
              }`}>
                {getTypeLabel(currentImage.type)}
              </span>
              <span className="text-sm text-gray-300">
                {currentIndex + 1} de {images.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image */}
            <Image
              src={currentImage.url}
              alt={currentImage.description || currentImage.name}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Footer with image info */}
          <div className="p-4 text-white bg-black/50">
            <div className="max-w-4xl mx-auto">
              {currentImage.description && (
                <p className="text-sm mb-2">{currentImage.description}</p>
              )}
              <div className="flex justify-between items-center text-xs text-gray-300">
                <span>Subida: {new Date(currentImage.uploadDate).toLocaleDateString('es-ES')}</span>
                {images.length > 1 && (
                  <div className="flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard navigation overlay */}
        <div
          className="absolute inset-0 -z-10"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft') prevImage();
            else if (e.key === 'ArrowRight') nextImage();
          }}
        />
      </div>
    </Portal>
  );
}