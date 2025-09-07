'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { formatUnits } from 'viem';
import NFTDetailsModal from './NFTDetailsModal';
import distributorArtifact from '@/lib/abi/RevenueDistributor.json';

const NFTMarketplace = () => {
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [transactionHash, setTransactionHash] = useState('');

  // Blockchain hooks
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { writeContractAsync } = useWriteContract();
  const { isLoading: isPending, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: transactionHash });

  // Contract addresses
  const revenueDistributorAddress = '0x1234567890123456789012345678901234567890'; // Replace with actual address
  const distributorAbi = distributorArtifact.abi;

  // Contract reads
  const { data: totalSupplyData, refetch: refetchSupply } = useReadContract({
    address: revenueDistributorAddress,
    abi: distributorAbi,
    functionName: 'totalSupply',
  });

  const totalSupply = Number(totalSupplyData ?? BigInt(0));

  // Load minted NFTs from localStorage
  useEffect(() => {
    const loadMintedNFTs = () => {
      const storedNFTs = JSON.parse(localStorage.getItem('flowmint_minted_nfts') || '[]');
      setMintedNFTs(storedNFTs);
    };

    loadMintedNFTs();
    
    // Listen for new NFTs
    const handleStorageChange = () => {
      loadMintedNFTs();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle NFT purchase
  const handlePurchaseNFT = async (nft) => {
    try {
      setShowTransactionModal(true);
      setTransactionStatus('pending');
      setTransactionHash('');
      
      // For demo purposes, we'll simulate a purchase by minting a new NFT
      // In a real implementation, this would be a transfer or purchase transaction
      const mockTokenURI = `https://example.com/nft/${totalSupply + 1}.json`;
      const hash = await writeContractAsync({
        address: revenueDistributorAddress,
        abi: distributorAbi,
        functionName: 'mint',
        args: [mockTokenURI],
        gas: 500000n,
      });
      
      setTransactionHash(hash);
      setTransactionStatus('confirming');
      
      // Add to purchased NFTs
      const purchasedNFT = {
        ...nft,
        id: Date.now(),
        owner: address,
        purchasePrice: nft.investmentValue,
        purchaseDate: new Date().toISOString(),
        tokenId: totalSupply + 1
      };
      
      const purchasedNFTs = JSON.parse(localStorage.getItem('flowmint_purchased_nfts') || '[]');
      purchasedNFTs.push(purchasedNFT);
      localStorage.setItem('flowmint_purchased_nfts', JSON.stringify(purchasedNFTs));
      
    } catch (error) {
      console.error('Purchase error:', error);
      setTransactionStatus('error');
      setTransactionHash('');
    }
  };

  const handleViewNFT = (nft) => {
    setSelectedNFT(nft);
    setShowNFTModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">NFT Marketplace</h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Discover and purchase unique revenue-sharing NFTs from creators. Each NFT represents a share in future creator earnings.
        </p>
      </div>

      {/* Wallet Connection */}
      {!isConnected ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Connect Your Wallet</h3>
          <p className="text-gray-300 mb-6">Connect your wallet to start purchasing NFTs</p>
          <button
            onClick={() => connect({ connector: injected() })}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-bold text-lg"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          {/* Connected Wallet Info */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Connected Wallet</h3>
                <p className="text-gray-300 text-sm font-mono">{address}</p>
              </div>
              {chainId !== 80002 && (
                <div className="p-2 bg-yellow-600/20 border border-yellow-500 rounded text-yellow-300 text-xs">
                  ⚠️ Switch to Polygon Amoy
                </div>
              )}
            </div>
          </div>

          {/* Available NFTs */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Available NFTs</h2>
              <div className="flex items-center space-x-2">
                <span className="text-gray-300">Total Supply:</span>
                <span className="text-white font-bold">{totalSupply}</span>
              </div>
            </div>

            {mintedNFTs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">No NFTs Available</h3>
                <p className="text-gray-300">No NFTs have been minted yet. Check back later!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mintedNFTs.map((nft) => (
                  <div key={nft.id} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group">
                    <div className="relative mb-4">
                      <img
                        src={nft.image}
                        alt={nft.characterType}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          nft.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                          nft.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-300' :
                          nft.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-300' :
                          nft.rarity === 'Uncommon' ? 'bg-green-500/20 text-green-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {nft.rarity}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{nft.characterType}</h3>
                        <p className="text-gray-300 text-sm">{nft.expression} • {nft.accessory}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Investment Value</p>
                          <p className="text-green-400 font-bold text-lg">${nft.investmentValue}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">Token ID</p>
                          <p className="text-white font-semibold">#{nft.tokenId}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewNFT(nft)}
                          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handlePurchaseNFT(nft)}
                          disabled={isPending}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                        >
                          Purchase
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* NFT Details Modal */}
      <NFTDetailsModal
        nft={selectedNFT}
        isOpen={showNFTModal}
        onClose={() => setShowNFTModal(false)}
        onMint={(nftData) => {
          if (nftData) {
            handlePurchaseNFT(nftData);
          }
        }}
      />

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-md w-full">
            <div className="text-center">
              {transactionStatus === 'pending' && (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold text-white mb-2">Transaction Pending</h3>
                  <p className="text-gray-300">Please check your wallet to confirm the transaction</p>
                </>
              )}
              {transactionStatus === 'confirming' && (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold text-white mb-2">Confirming Transaction</h3>
                  <p className="text-gray-300">Waiting for blockchain confirmation...</p>
                  {transactionHash && (
                    <p className="text-xs text-blue-400 mt-2 break-all">Hash: {transactionHash}</p>
                  )}
                </>
              )}
              {transactionStatus === 'success' && (
                <>
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Purchase Successful!</h3>
                  <p className="text-gray-300">Your NFT has been purchased and added to your collection</p>
                </>
              )}
              {transactionStatus === 'error' && (
                <>
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Purchase Failed</h3>
                  <p className="text-gray-300">Please try again or check your wallet</p>
                </>
              )}
              <button
                onClick={() => setShowTransactionModal(false)}
                className="mt-6 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTMarketplace;
