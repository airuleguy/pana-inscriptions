import React, { useState, useEffect, useCallback } from 'react';
import { APIService } from '@/lib/api';

interface FigImageProps {
  figId: string;
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

interface FigImageState {
  src: string;
  loading: boolean;
  error: boolean;
  retryCount: number;
}

/**
 * Optimized FIG Image component with caching, lazy loading, and fallbacks
 * 
 * Features:
 * - Uses backend image proxy for better performance
 * - Lazy loading with Intersection Observer
 * - Automatic retry on failure
 * - Fallback image support
 * - Loading states
 * - Error handling
 */
export const FigImage: React.FC<FigImageProps> = ({
  figId,
  alt,
  className = '',
  width,
  height,
  quality = 85,
  fallbackSrc = '/placeholder-avatar.png',
  lazy = true,
  onLoad,
  onError,
}) => {
  const [state, setState] = useState<FigImageState>({
    src: '',
    loading: true,
    error: false,
    retryCount: 0,
  });

  const [inView, setInView] = useState(!lazy);

  // Generate the proxied image URL
  const proxiedUrl = APIService.getProxiedImageUrl(figId, {
    width,
    height,
    quality,
  });

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
    if (!inView || !figId) return;

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
              src: proxiedUrl, 
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

        img.src = proxiedUrl;
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
        onError?.(new Error(`Failed to load image for FIG ID: ${figId}`));
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [inView, figId, proxiedUrl, fallbackSrc, state.retryCount, onLoad, onError]);

  // Show placeholder while loading or not in view
  if (!inView || (state.loading && !state.src)) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
        style={{ width, height }}
        aria-label={`Loading image for ${alt}`}
      >
        <svg
          className="w-8 h-8 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imgRef}
        src={state.src || fallbackSrc}
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
          if (state.src !== fallbackSrc) {
            setState(prev => ({ 
              ...prev, 
              src: fallbackSrc, 
              loading: false, 
              error: true 
            }));
          }
        }}
      />
      
      {state.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {state.error && (
        <div className="absolute top-1 right-1">
          <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
            Cached
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Hook for preloading images for better UX
 */
export const useFigImagePreloader = () => {
  const preloadImages = useCallback(async (figIds: string[]) => {
    try {
      await APIService.preloadImages(figIds);
    } catch (error) {
      console.warn('Failed to preload FIG images:', error);
    }
  }, []);

  const preloadPeopleImages = useCallback(async <T extends { figId?: string; id?: string }>(people: T[]) => {
    await APIService.preloadPeopleImages(people);
  }, []);

  return {
    preloadImages,
    preloadPeopleImages,
  };
};

/**
 * Coach Image component that handles both local and FIG coaches
 */
export const CoachImage: React.FC<{
  coachId: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  fallbackSrc?: string;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}> = ({
  coachId,
  alt,
  className = '',
  width,
  height,
  quality = 85,
  fallbackSrc = '/placeholder-avatar.png',
  lazy = true,
  onLoad,
  onError,
}) => {
  const [state, setState] = useState<FigImageState>({
    src: '',
    loading: true,
    error: false,
    retryCount: 0,
  });

  const [inView, setInView] = useState(!lazy);

  // Generate the coach image URL
  const coachImageUrl = APIService.getCoachImageUrl(coachId, {
    width,
    height,
    quality,
  });

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
    if (!inView || !coachId) return;

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
              src: coachImageUrl, 
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

        img.src = coachImageUrl;
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
        onError?.(new Error(`Failed to load image for coach ID: ${coachId}`));
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [inView, coachId, coachImageUrl, fallbackSrc, state.retryCount, onLoad, onError]);

  // Show placeholder while loading or not in view
  if (!inView || (state.loading && !state.src)) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
        style={{ width, height }}
        aria-label={`Loading image for ${alt}`}
      >
        <svg
          className="w-8 h-8 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imgRef}
        src={state.src || fallbackSrc}
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
          if (state.src !== fallbackSrc) {
            setState(prev => ({ 
              ...prev, 
              src: fallbackSrc, 
              loading: false, 
              error: true 
            }));
          }
        }}
      />
      
      {state.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {state.error && (
        <div className="absolute top-1 right-1">
          <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
            Cached
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Simple avatar component for people with FIG IDs
 */
export const FigAvatar: React.FC<{
  figId: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ figId, name, size = 'md', className = '' }) => {
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
    <FigImage
      figId={figId}
      alt={`${name} profile picture`}
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      width={sizePx[size]}
      height={sizePx[size]}
      quality={90}
    />
  );
};

/**
 * Simple avatar component for coaches (handles both local and FIG coaches)
 */
export const CoachAvatar: React.FC<{
  coachId: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ coachId, name, size = 'md', className = '' }) => {
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
    <CoachImage
      coachId={coachId}
      alt={`${name} profile picture`}
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      width={sizePx[size]}
      height={sizePx[size]}
      quality={90}
    />
  );
}; 