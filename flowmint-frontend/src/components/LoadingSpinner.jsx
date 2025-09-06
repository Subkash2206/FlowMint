'use client';

import React from 'react';

const LoadingSpinner = ({ size = 'large', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className={`animate-spin rounded-full border-b-2 border-purple-400 ${sizeClasses[size]}`}></div>
      <p className="mt-4 text-gray-300">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
