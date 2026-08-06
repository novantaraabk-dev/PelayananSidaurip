import React from 'react';

export function BackgroundPattern() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* Soft Ambient Glows behind sections for depth */}
      <div className="absolute top-[500px] -left-[200px] w-[600px] h-[600px] rounded-full bg-sky-500/5 blur-[140px] pointer-events-none" />
      <div className="absolute top-[1800px] -right-[200px] w-[700px] h-[700px] rounded-full bg-teal-400/5 blur-[150px] pointer-events-none" />
      <div className="absolute top-[3200px] -left-[200px] w-[600px] h-[600px] rounded-full bg-amber-300/5 blur-[130px] pointer-events-none" />
      <div className="absolute top-[4600px] right-[10%] w-[650px] h-[650px] rounded-full bg-sky-400/5 blur-[140px] pointer-events-none" />

      {/* Feather Swirl Organic Leaf Background Pattern (Soft Subtle 25% Transparency) */}
      <div 
        className="absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: `url('/bg-pattern.svg')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 300px',
        }}
      />
    </div>
  );
}

