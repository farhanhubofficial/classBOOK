// src/LoadingScreen.js
import React from 'react';
import { GiSpellBook } from 'react-icons/gi';

function LoadingScreen() {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-white">
      {/* Logo Title */}
      <div className="flex items-center gap-2 text-green-600 text-2xl font-bold mb-6">
        <GiSpellBook />
        classBOOK
      </div>

      {/* Animated Square Spinners */}
      <div className="flex gap-2">
        <div
          className="w-4 h-4 bg-green-600 rounded-sm animate-bounce-square"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="w-4 h-4 bg-green-600 rounded-sm animate-bounce-square"
          style={{ animationDelay: '0.2s' }}
        />
        <div
          className="w-4 h-4 bg-green-600 rounded-sm animate-bounce-square"
          style={{ animationDelay: '0.4s' }}
        />
      </div>
    </div>
  );
}

export default LoadingScreen;
