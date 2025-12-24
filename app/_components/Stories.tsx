'use client';

import { useEffect, useState } from 'react';

// Mock data for stories - in a real app this might come from an API
const stories = [
  { id: 1, name: 'Novedades', image: 'https://ui-avatars.com/api/?name=Novedades&background=random' },
  { id: 2, name: 'Ganadores', image: 'https://ui-avatars.com/api/?name=Ganadores&background=random' },
  { id: 3, name: 'Promos', image: 'https://ui-avatars.com/api/?name=Promos&background=random' },
  { id: 4, name: 'Eventos', image: 'https://ui-avatars.com/api/?name=Eventos&background=random' },
  { id: 5, name: 'Ayuda', image: 'https://ui-avatars.com/api/?name=Ayuda&background=random' },
];

export default function Stories() {
  return (
    <div className="bg-white border-b border-gray-200 py-4 mb-2">
      <div className="flex space-x-4 overflow-x-auto px-4 no-scrollbar">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600">
              <div className="w-full h-full rounded-full p-[2px] bg-white">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-xs text-gray-600 truncate w-16 text-center">{story.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
