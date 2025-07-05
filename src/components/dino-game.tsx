"use client";
import React from 'react';
import ChromeDinoGame from 'react-chrome-dino';

export default function DinoGame() {
  React.useEffect(() => {
    const preventScroll = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', preventScroll, { capture: true });
    return () => window.removeEventListener('keydown', preventScroll, { capture: true });
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <ChromeDinoGame />
    </div>
  );
} 