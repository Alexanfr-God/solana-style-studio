
import React from 'react';

const AnimatedStars = () => {
  return (
    <div className="stars-container absolute inset-0 z-[-1]">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes move-stars {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(-1000px);
            }
          }
          
          .stars-container {
            background: transparent url('/stars-bg.png') repeat top center;
            z-index: -1;
            height: 100%;
            width: 100%;
          }
          
          .stars-container:after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            display: block;
            background: transparent url('/stars-bg.png') repeat top center;
            z-index: -1;
            animation: move-stars 200s linear infinite;
          }
        `
      }} />
    </div>
  );
};

export default AnimatedStars;
