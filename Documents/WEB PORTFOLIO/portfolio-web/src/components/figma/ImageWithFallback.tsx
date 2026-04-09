import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fetchPriority?: 'high' | 'low' | 'auto';
  fetchpriority?: 'high' | 'low' | 'auto';
  optimizeSupabase?: boolean;
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)
  const [localFallbackFailed, setLocalFallbackFailed] = useState(false)

  const { 
    src, 
    alt, 
    style, 
    className, 
    loading = 'lazy', 
    fetchPriority = 'auto',
    fetchpriority,
    decoding = 'async',
    optimizeSupabase = false, // Not used anymore since we do local intercept
    ...rest 
  } = props

  // Intercept Supabase URLs to serve our lightning fast local WebP versions
  let finalSrc = src;
  let isSupabaseUrl = false;
  if (finalSrc && typeof finalSrc === 'string' && finalSrc.includes('cnsezqmwmygeiypakeri.supabase.co')) {
    isSupabaseUrl = true;
    if (!localFallbackFailed) {
      try {
        const urlObj = new URL(finalSrc);
        const filename = decodeURIComponent(urlObj.pathname.split('/').pop() || '');
        if (filename) {
          const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
          finalSrc = `/optimized/${baseName}_optimized.webp`;
        }
      } catch (e) {}
    }
  }

  const handleError = () => {
    if (isSupabaseUrl && !localFallbackFailed) {
      // If our local WebP doesn't exist (e.g. newly uploaded project), fallback to the original Supabase URL
      setLocalFallbackFailed(true);
    } else {
      setDidError(true);
    }
  }

  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
        </div>
      </div>
    )
  }

  return (
    <img 
      src={finalSrc} 
      alt={alt} 
      className={className} 
      style={style} 
      loading={loading}
      decoding={decoding}
      {...rest} 
      {...{ fetchpriority: fetchpriority || fetchPriority }}
      onError={handleError} 
    />
  )
}
