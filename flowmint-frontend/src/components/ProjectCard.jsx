'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import distributorArtifact from '@/lib/abi/RevenueDistributor.json';

const ProjectCard = ({ project, isOwner = false }) => {
  const { isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const [investing, setInvesting] = useState(false);

  const distributorAbi = distributorArtifact.abi;
  const revenueDistributorAddress = '0x3a4E9Fa1D8cE4Ee6b75Ef498903eBc8C1E92e507';

  const handleInvest = () => {
    if (!isConnected) {
      alert('Please connect your wallet to invest');
      return;
    }
    
    setInvesting(true);
    // For demo purposes, we'll mint an NFT as investment
    const mockTokenURI = `https://example.com/nft/${project.nft_token_id}.json`;
    writeContract({
      address: revenueDistributorAddress,
      abi: distributorAbi,
      functionName: 'mint',
      args: [mockTokenURI],
    });
    
    setTimeout(() => setInvesting(false), 3000);
  };
  const progressPercentage = project.target_revenue 
    ? (project.current_revenue / project.target_revenue) * 100 
    : 0;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200 group">
      <div className="relative mb-4">
        <div className="w-full h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-4 overflow-hidden">
          {project.image_url ? (
            <img 
              src={project.image_url} 
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-4xl">🎨</span>
            </div>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-black/50 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {project.category || 'General'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-200">
            {project.name}
          </h3>
          <p className="text-gray-300 text-sm line-clamp-2">
            {project.description || 'No description available'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Progress</span>
            <span className="text-white font-semibold">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">${project.current_revenue.toLocaleString()}</span>
            <span className="text-gray-300">${project.target_revenue?.toLocaleString() || '∞'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-green-400 text-sm font-semibold">
              {project.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          {isOwner ? (
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 transition-colors duration-200">
                Edit
              </button>
              <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30 transition-colors duration-200">
                View
              </button>
            </div>
          ) : (
            <button 
              onClick={handleInvest}
              disabled={isPending || investing}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg text-sm transition-all duration-200 transform hover:scale-105 disabled:cursor-not-allowed"
            >
              {investing ? 'Investing...' : isPending ? 'Processing...' : 'Invest'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
