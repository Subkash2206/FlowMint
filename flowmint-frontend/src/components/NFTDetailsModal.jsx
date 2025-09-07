'use client';

import React from 'react';

const NFTDetailsModal = ({ nft, isOpen, onClose, onMint }) => {
  if (!isOpen || !nft) return null;

  const rarityColors = {
    'Common': '#9ca3af',
    'Uncommon': '#10b981',
    'Rare': '#3b82f6',
    'Epic': '#8b5cf6',
    'Legendary': '#f59e0b'
  };

  const rarityColor = rarityColors[nft.rarity] || rarityColors['Uncommon'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Your Generated NFT</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* NFT Image */}
          <div className="text-center">
            <div className="relative inline-block">
              <img
                src={nft.image}
                alt="Generated NFT"
                className="w-64 h-64 rounded-lg border-2 border-gray-200 shadow-lg"
              />
              {/* Rarity Badge */}
              <div 
                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-white font-bold text-sm"
                style={{ backgroundColor: rarityColor }}
              >
                {nft.rarity?.toUpperCase() || 'UNCOMMON'}
              </div>
            </div>
          </div>

          {/* NFT Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">NFT Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Token ID:</span>
                <span className="font-semibold text-gray-900">#{nft.tokenId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Investment Value:</span>
                <span className="font-bold text-green-600">${nft.investmentValue}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Character Type:</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  {nft.characterType}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Expression:</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                  {nft.expression}
                </span>
              </div>
            </div>
          </div>

          {/* Traits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Traits</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-center">
                <div className="font-medium">{nft.accessory}</div>
                <div className="text-xs text-yellow-600">Accessory</div>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-center">
                <div className="font-medium">{nft.bodyShape}</div>
                <div className="text-xs text-green-600">Body Shape</div>
              </div>
              <div className="bg-pink-100 text-pink-800 px-3 py-2 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300" 
                    style={{ backgroundColor: nft.primaryColor }}
                  ></div>
                  <span className="font-medium">{nft.primaryColor}</span>
                </div>
                <div className="text-xs text-pink-600">Primary Color</div>
              </div>
              <div className="bg-pink-100 text-pink-800 px-3 py-2 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300" 
                    style={{ backgroundColor: nft.secondaryColor }}
                  ></div>
                  <span className="font-medium">{nft.secondaryColor}</span>
                </div>
                <div className="text-xs text-pink-600">Secondary Color</div>
              </div>
              <div className="bg-pink-100 text-pink-800 px-3 py-2 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300" 
                    style={{ backgroundColor: nft.accentColor }}
                  ></div>
                  <span className="font-medium">{nft.accentColor}</span>
                </div>
                <div className="text-xs text-pink-600">Accent Color</div>
              </div>
              <div className="bg-pink-100 text-pink-800 px-3 py-2 rounded-lg text-center">
                <div className="font-medium">Gradient</div>
                <div className="text-xs text-pink-600">Background</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {nft.description || `A unique ${nft.rarity?.toLowerCase() || 'uncommon'} ${nft.characterType?.toLowerCase() || 'character'} NFT featuring ${nft.expression?.toLowerCase() || 'neutral'} expression and ${nft.accessory?.toLowerCase() || 'no'} accessory.`}
            </p>
          </div>

          {/* Minting Status */}
          {nft.minting && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-800 font-medium">Minting to blockchain...</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors duration-200 font-medium"
            >
              Close
            </button>
            {onMint && !nft.minting && (
              <button
                onClick={() => onMint(nft)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 font-semibold"
              >
                Mint NFT
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetailsModal;
