// TypeScript declaration for Google Model Viewer
declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        'shadow-intensity'?: string;
        'ar'?: boolean;
        'ar-modes'?: string;
        'environment-image'?: string;
        'exposure'?: string;
        'poster'?: string;
        'seamless-poster'?: boolean;
        'loading'?: 'auto' | 'lazy' | 'eager';
        'reveal'?: 'auto' | 'interaction' | 'manual';
      },
      HTMLElement
    >;
  }
}
