'use client';

import React from 'react';

export function DeveloperBadge() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className="block bg-neutral-900 text-white text-[10px] md:text-xs px-3 py-1.5 rounded-full shadow-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        onClick={() => console.log('Developer Info')}
      >
        Crafted by TechInventive
      </div>
    </div>
  );
}
