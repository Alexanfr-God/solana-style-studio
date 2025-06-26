
declare namespace JSX {
  interface IntrinsicElements {
    'dotlottie-player': {
      src?: string;
      background?: string;
      speed?: string | number;
      style?: React.CSSProperties;
      loop?: boolean;
      autoplay?: boolean;
      direction?: number;
      mode?: string;
      controls?: boolean;
      hover?: boolean;
      click?: boolean;
      intermission?: number;
      playMode?: string;
      renderer?: string;
      segment?: [number, number];
      count?: number;
      subframe?: boolean;
      preserveAspectRatio?: string;
    };
  }
}
