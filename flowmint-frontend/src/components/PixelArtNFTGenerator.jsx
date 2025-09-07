'use client';

import React, { useState, useRef } from 'react';

const PixelArtNFTGenerator = ({ onNFTCreated, onMintNFT, className = "" }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNFT, setGeneratedNFT] = useState(null);
  const canvasRef = useRef(null);

  const characterTypes = ['Robot', 'Alien', 'Wizard', 'Warrior', 'Ninja', 'Knight', 'Mage', 'Archer'];
  const expressions = ['Happy', 'Neutral', 'Angry', 'Surprised', 'Sad', 'Excited'];
  const accessories = ['Glasses', 'Hat', 'Crown', 'Mask', 'Helmet', 'None'];
  const bodyShapes = ['Round', 'Square', 'Tall', 'Wide', 'Slim'];
  const rarityLevels = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
  const rarityWeights = [40, 30, 20, 8, 2]; // Percentage chances

  const colorPalettes = {
    'Common': ['#82E0AA', '#96CEB4', '#A8E6CF', '#B8E6B8'],
    'Uncommon': ['#FFB6C1', '#FFC0CB', '#FFB6C1', '#FFA0B4'],
    'Rare': ['#87CEEB', '#98D8E8', '#B0E0E6', '#ADD8E6'],
    'Epic': ['#DDA0DD', '#E6E6FA', '#F0E68C', '#F5DEB3'],
    'Legendary': ['#FFD700', '#FFA500', '#FF8C00', '#FF6347']
  };

  const generateRandomNFT = () => {
    setIsGenerating(true);
    
    // Generate random traits
    const characterType = characterTypes[Math.floor(Math.random() * characterTypes.length)];
    const expression = expressions[Math.floor(Math.random() * expressions.length)];
    const accessory = accessories[Math.floor(Math.random() * accessories.length)];
    const bodyShape = bodyShapes[Math.floor(Math.random() * bodyShapes.length)];
    
    // Determine rarity based on weights
    const rarity = determineRarity();
    const colors = colorPalettes[rarity];
    
    const primaryColor = colors[Math.floor(Math.random() * colors.length)];
    const secondaryColor = colors[Math.floor(Math.random() * colors.length)];
    const accentColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Generate pixel art
    const pixelArt = generatePixelArt(characterType, expression, accessory, bodyShape, primaryColor, secondaryColor, accentColor);
    
    const nftData = {
      id: Date.now(),
      tokenId: Math.floor(Math.random() * 10000) + 1,
      characterType,
      expression,
      accessory,
      bodyShape,
      rarity,
      primaryColor,
      secondaryColor,
      accentColor,
      image: pixelArt,
      investmentValue: calculateInvestmentValue(rarity),
      description: `A unique ${rarity.toLowerCase()} ${characterType.toLowerCase()} NFT with ${expression.toLowerCase()} expression and ${accessory.toLowerCase()} accessory.`,
      traits: [
        { trait_type: 'Character Type', value: characterType },
        { trait_type: 'Expression', value: expression },
        { trait_type: 'Accessory', value: accessory },
        { trait_type: 'Body Shape', value: bodyShape },
        { trait_type: 'Rarity', value: rarity },
        { trait_type: 'Primary Color', value: primaryColor },
        { trait_type: 'Secondary Color', value: secondaryColor },
        { trait_type: 'Accent Color', value: accentColor },
        { trait_type: 'Background', value: 'Gradient' }
      ]
    };
    
    setGeneratedNFT(nftData);
    setIsGenerating(false);
    
    if (onNFTCreated) {
      onNFTCreated(nftData);
    }
  };

  const determineRarity = () => {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (let i = 0; i < rarityLevels.length; i++) {
      cumulative += rarityWeights[i];
      if (random <= cumulative) {
        return rarityLevels[i];
      }
    }
    return 'Common';
  };

  const calculateInvestmentValue = (rarity) => {
    const baseValues = {
      'Common': 25,
      'Uncommon': 60,
      'Rare': 150,
      'Epic': 400,
      'Legendary': 1000
    };
    return baseValues[rarity] || 25;
  };

  const generatePixelArt = (characterType, expression, accessory, bodyShape, primaryColor, secondaryColor, accentColor) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;
    
    // Create gradient background
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, primaryColor + '80');
    gradient.addColorStop(0.5, secondaryColor + '60');
    gradient.addColorStop(1, accentColor + '40');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Draw pixel art character (simplified pixel art style)
    drawPixelCharacter(ctx, characterType, expression, accessory, bodyShape, primaryColor, secondaryColor, accentColor);
    
    // Add FlowMint branding
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(512 - 150, 20, 130, 35);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FLOWMINT', 512 - 85, 42);
    
    // Add rarity indicator
    const rarityColors = {
      'Common': '#9ca3af',
      'Uncommon': '#10b981',
      'Rare': '#3b82f6',
      'Epic': '#8b5cf6',
      'Legendary': '#f59e0b'
    };
    
    const rarityColor = rarityColors[characterType] || rarityColors['Common'];
    ctx.fillStyle = rarityColor;
    ctx.fillRect(20, 20, 120, 35);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('UNCOMMON', 80, 42);
    
    return canvas.toDataURL('image/png');
  };

  const drawPixelCharacter = (ctx, characterType, expression, accessory, bodyShape, primaryColor, secondaryColor, accentColor) => {
    // Simplified pixel art drawing - creating a blocky character
    const centerX = 256;
    const centerY = 256;
    
    // Body (main shape)
    ctx.fillStyle = primaryColor;
    if (bodyShape === 'Round') {
      ctx.beginPath();
      ctx.arc(centerX, centerY + 50, 80, 0, Math.PI * 2);
      ctx.fill();
    } else if (bodyShape === 'Square') {
      ctx.fillRect(centerX - 60, centerY - 10, 120, 120);
    } else if (bodyShape === 'Tall') {
      ctx.fillRect(centerX - 40, centerY - 30, 80, 140);
    } else if (bodyShape === 'Wide') {
      ctx.fillRect(centerX - 80, centerY + 20, 160, 80);
    } else { // Slim
      ctx.fillRect(centerX - 30, centerY - 20, 60, 100);
    }
    
    // Head
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(centerX - 40, centerY - 80, 80, 80);
    
    // Eyes
    ctx.fillStyle = '#000000';
    if (expression === 'Happy') {
      // Happy eyes (curved)
      ctx.beginPath();
      ctx.arc(centerX - 20, centerY - 50, 8, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX + 20, centerY - 50, 8, 0, Math.PI);
      ctx.stroke();
    } else if (expression === 'Angry') {
      // Angry eyes (slanted)
      ctx.fillRect(centerX - 25, centerY - 55, 15, 5);
      ctx.fillRect(centerX + 10, centerY - 55, 15, 5);
    } else if (expression === 'Surprised') {
      // Surprised eyes (big circles)
      ctx.beginPath();
      ctx.arc(centerX - 20, centerY - 50, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + 20, centerY - 50, 12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Neutral eyes (simple squares)
      ctx.fillRect(centerX - 25, centerY - 55, 10, 10);
      ctx.fillRect(centerX + 15, centerY - 55, 10, 10);
    }
    
    // Mouth
    ctx.fillStyle = '#000000';
    if (expression === 'Happy') {
      // Happy mouth (curve)
      ctx.beginPath();
      ctx.arc(centerX, centerY - 20, 15, 0, Math.PI);
      ctx.stroke();
    } else if (expression === 'Sad') {
      // Sad mouth (inverted curve)
      ctx.beginPath();
      ctx.arc(centerX, centerY - 10, 15, Math.PI, 0);
      ctx.stroke();
    } else {
      // Neutral mouth (line)
      ctx.fillRect(centerX - 15, centerY - 25, 30, 3);
    }
    
    // Accessory
    if (accessory === 'Glasses') {
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(centerX - 35, centerY - 60, 20, 15);
      ctx.strokeRect(centerX + 15, centerY - 60, 20, 15);
      ctx.beginPath();
      ctx.moveTo(centerX - 15, centerY - 52);
      ctx.lineTo(centerX + 15, centerY - 52);
      ctx.stroke();
    } else if (accessory === 'Hat') {
      ctx.fillStyle = accentColor;
      ctx.fillRect(centerX - 50, centerY - 100, 100, 20);
    } else if (accessory === 'Crown') {
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(centerX - 30, centerY - 100, 60, 15);
      // Crown points
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(centerX - 25 + (i * 12), centerY - 110, 8, 15);
      }
    }
    
    // Add some pixel art details
    ctx.fillStyle = accentColor;
    for (let i = 0; i < 20; i++) {
      const x = centerX - 100 + Math.random() * 200;
      const y = centerY - 100 + Math.random() * 200;
      ctx.fillRect(x, y, 4, 4);
    }
  };

  const handleMintNFT = () => {
    if (generatedNFT && onMintNFT) {
      // Save to localStorage for marketplace
      const mintedNFTs = JSON.parse(localStorage.getItem('flowmint_minted_nfts') || '[]');
      const nftToSave = {
        ...generatedNFT,
        id: Date.now(),
        mintDate: new Date().toISOString(),
        creator: 'Current User', // In real app, this would be the connected wallet address
        status: 'available'
      };
      mintedNFTs.push(nftToSave);
      localStorage.setItem('flowmint_minted_nfts', JSON.stringify(mintedNFTs));
      
      onMintNFT(generatedNFT);
    }
  };

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">🎮 Pixel Art NFT Generator</h2>
        <div className="flex items-center space-x-2 text-green-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Random Generation</span>
        </div>
      </div>

      <div className="space-y-6">
        {!generatedNFT ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Generate Your Pixel Art NFT</h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Create a unique pixel art character with random traits, rarity levels, and investment values. 
              Each NFT is completely unique!
            </p>
            <button
              onClick={generateRandomNFT}
              disabled={isGenerating}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center space-x-2 mx-auto"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generate NFT</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Your Generated NFT</h3>
                <div className="relative">
                  <img
                    src={generatedNFT.image}
                    alt="Generated NFT"
                    className="w-full rounded-lg border-2 border-purple-500/30 shadow-2xl"
                  />
                  <div className="absolute top-2 right-2 bg-black/50 rounded-full p-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">NFT Details</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Token ID:</span>
                    <span className="text-white font-medium">#{generatedNFT.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Investment Value:</span>
                    <span className="text-green-400 font-bold">${generatedNFT.investmentValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Character Type:</span>
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm">{generatedNFT.characterType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expression:</span>
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-sm">{generatedNFT.expression}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-semibold text-white mb-3">Traits</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-sm text-center">{generatedNFT.accessory}</span>
                    <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-sm text-center">{generatedNFT.bodyShape}</span>
                    <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-sm text-center flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: generatedNFT.primaryColor }}></div>
                      {generatedNFT.primaryColor}
                    </span>
                    <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-sm text-center flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: generatedNFT.secondaryColor }}></div>
                      {generatedNFT.secondaryColor}
                    </span>
                    <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-sm text-center flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: generatedNFT.accentColor }}></div>
                      {generatedNFT.accentColor}
                    </span>
                    <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-sm text-center">Gradient</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={generateRandomNFT}
                    disabled={isGenerating}
                    className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Generate New</span>
                  </button>
                  
                  <button
                    onClick={handleMintNFT}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-bold text-lg flex items-center justify-center space-x-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Mint NFT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PixelArtNFTGenerator;
