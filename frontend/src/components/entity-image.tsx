'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { APIService } from '@/lib/api';

interface EntityImageProps {
  id: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  fallbackSrc?: string;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface EntityImageState {
  src: string;
  loading: boolean;
  error: boolean;
  retryCount: number;
}

/**
 * Optimized Image component that can handle both FIG and S3 images
 * 
 * Features:
 * - Handles both FIG API and S3/local storage images
 * - Lazy loading with Intersection Observer
 * - Automatic retry on failure
 * - Fallback image support
 * - Loading states
 * - Error handling
 */
export const EntityImage: React.FC<EntityImageProps> = ({
  id,
  alt,
  className = '',
  width,
  height,
  quality = 85,
  fallbackSrc = '/images/default-avatar.png',
  lazy = true,
  onLoad,
  onError,
}) => {
  const [state, setState] = useState<EntityImageState>({
    src: '',
    loading: true,
    error: false,
    retryCount: 0,
  });

  const [inView, setInView] = useState(!lazy);

  // Generate the image URL
  const imageUrl = `/api/v1/images/gymnast/${id}${
    width || height || quality
      ? `?${[
          width && `width=${width}`,
          height && `height=${height}`,
          quality && `quality=${quality}`,
        ]
          .filter(Boolean)
          .join('&')}`
      : ''
  }`;

  // Intersection Observer for lazy loading
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (!node || !lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [lazy]);

  // Load image when in view
  useEffect(() => {
    if (!inView || !id) return;

    let isMounted = true;

    const loadImage = async () => {
      setState(prev => ({ ...prev, loading: true, error: false }));

      try {
        // Create a new image to preload
        const img = new Image();
        
        img.onload = () => {
          if (isMounted) {
            setState(prev => ({ 
              ...prev, 
              src: imageUrl, 
              loading: false, 
              error: false 
            }));
            onLoad?.();
          }
        };

        img.onerror = () => {
          if (isMounted) {
            handleImageError();
          }
        };

        img.src = imageUrl;
      } catch (error) {
        if (isMounted) {
          handleImageError();
        }
      }
    };

    const handleImageError = () => {
      const newRetryCount = state.retryCount + 1;
      
      if (newRetryCount < 3) {
        // Retry loading after a delay
        setTimeout(() => {
          if (isMounted) {
            setState(prev => ({ ...prev, retryCount: newRetryCount }));
            loadImage();
          }
        }, 1000 * newRetryCount);
      } else {
        // Max retries reached, use fallback
        setState(prev => ({ 
          ...prev, 
          src: fallbackSrc, 
          loading: false, 
          error: true 
        }));
        onError?.(new Error(`Failed to load image for ID: ${id}`));
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [inView, id, imageUrl, fallbackSrc, state.retryCount, onLoad, onError]);

  // Show placeholder while loading or not in view
  if (!inView || (state.loading && !state.src)) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-100 animate-pulse flex items-center justify-center ${className}`}
        style={{ width, height }}
        aria-label={`Loading image for ${alt}`}
      >
        <div className="text-gray-400 text-sm font-medium">
          {alt.split(' ')[0]?.charAt(0)?.toUpperCase() || '?'}
        </div>
      </div>
    );
  }

  // If in error state, show fallback with initials
  if (state.error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-full ${className}`}
        style={{ width, height }}
      >
        <div className="text-gray-500 text-sm font-medium">
          {alt.split(' ')[0]?.charAt(0)?.toUpperCase() || '?'}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imgRef}
        src={state.src}
        alt={alt}
        className={`transition-opacity duration-300 ${
          state.loading ? 'opacity-50' : 'opacity-100'
        }`}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={() => {
          setState(prev => ({ ...prev, loading: false }));
          onLoad?.();
        }}
        onError={() => {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: true 
          }));
          onError?.(new Error(`Failed to load image for ID: ${id}`));
        }}
      />
      
      {state.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

/**
 * Simple avatar component for entities with images
 */
export const EntityAvatar: React.FC<{
  id: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ id, name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const sizePx = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  return (
    <EntityImage
      id={id}
      alt={`${name} profile picture`}
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      width={sizePx[size]}
      height={sizePx[size]}
      quality={90}
    />
  );
};
