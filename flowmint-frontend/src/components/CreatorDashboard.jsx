'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { formatUnits } from 'viem';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';
import StatsCard from './StatsCard';
import RevenueChart from './RevenueChart';
import PixelArtNFTGenerator from './PixelArtNFTGenerator';
import NFTDetailsModal from './NFTDetailsModal';
import distributorArtifact from '@/lib/abi/RevenueDistributor.json';

const CreatorDashboard = ({ data, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generatedNFT, setGeneratedNFT] = useState(null);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [revenueAmount, setRevenueAmount] = useState('');
  const [tokenIdToClaim, setTokenIdToClaim] = useState('');
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
  const { data: maxSupplyData } = useReadContract({
    address: revenueDistributorAddress,
    abi: distributorAbi,
    functionName: 'maxSupply',
  });
  const { data: claimableRaw, refetch: refetchClaimable } = useReadContract({
    address: revenueDistributorAddress,
    abi: distributorAbi,
    functionName: 'getClaimableRevenue',
    args: tokenIdToClaim ? [BigInt(tokenIdToClaim)] : undefined,
    query: { enabled: !!tokenIdToClaim },
  });

  const totalSupply = Number(totalSupplyData ?? BigInt(0));
  const maxSupply = Number(maxSupplyData ?? BigInt(0));
  const claimableUSDC = claimableRaw ? `${formatUnits(claimableRaw, 6)} USDC` : null;

  // Blockchain action functions
  const handleMint = async () => {
    try {
      setShowTransactionModal(true);
      setTransactionStatus('pending');
      setTransactionHash('');
      
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
    } catch (error) {
      console.error('Mint error:', error);
      setTransactionStatus('error');
      setTransactionHash('');
    }
  };

  const handleDepositRevenue = async () => {
    try {
      setShowTransactionModal(true);
      setTransactionStatus('pending');
      setTransactionHash('');
      
      const amount = BigInt(Math.floor(parseFloat(revenueAmount) * 1e6)); // USDC has 6 decimals
      const hash = await writeContractAsync({
        address: revenueDistributorAddress,
        abi: distributorAbi,
        functionName: 'depositRevenue',
        args: [amount],
        gas: 500000n,
      });
      
      setTransactionHash(hash);
      setTransactionStatus('confirming');
    } catch (error) {
      console.error('Deposit error:', error);
      setTransactionStatus('error');
      setTransactionHash('');
    }
  };

  const handleClaimRevenue = async () => {
    try {
      setShowTransactionModal(true);
      setTransactionStatus('pending');
      setTransactionHash('');
      
      const hash = await writeContractAsync({
        address: revenueDistributorAddress,
        abi: distributorAbi,
        functionName: 'claimRevenue',
        args: [BigInt(tokenIdToClaim)],
        gas: 500000n,
      });
      
      setTransactionHash(hash);
      setTransactionStatus('confirming');
    } catch (error) {
      console.error('Claim error:', error);
      setTransactionStatus('error');
      setTransactionHash('');
    }
  };

  const handleDeleteProject = (projectId) => {
    try {
      // Get projects from localStorage using the correct key
      const storedProjects = JSON.parse(localStorage.getItem('flowmint_projects') || '[]');
      
      // Find the project to get its name for confirmation
      const projectToDelete = storedProjects.find(project => project.id === projectId);
      
      if (!projectToDelete) {
        alert('Project not found!');
        return;
      }
      
      // Filter out the deleted project
      const updatedProjects = storedProjects.filter(project => project.id !== projectId);
      
      // Update localStorage
      localStorage.setItem('flowmint_projects', JSON.stringify(updatedProjects));
      
      // Refresh the dashboard
      onRefresh();
      
      alert(`Project "${projectToDelete.name}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
        <p className="mt-4 text-gray-300">Loading dashboard...</p>
      </div>
    );
  }

  const { user, projects, total_revenue, total_investors, recent_investments } = data;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user.username}!
            </h2>
            <p className="text-gray-300">
              Manage your creative projects and track your revenue
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${total_revenue.toLocaleString()}`}
          icon="💰"
          color="from-green-500 to-emerald-500"
          change="+12%"
        />
        <StatsCard
          title="Active Projects"
          value={projects.length}
          icon="📁"
          color="from-blue-500 to-cyan-500"
          change="+2"
        />
        <StatsCard
          title="Total Investors"
          value={total_investors}
          icon="👥"
          color="from-purple-500 to-pink-500"
          change="+5"
        />
      </div>

      {/* Pixel Art NFT Generator */}
      <PixelArtNFTGenerator 
        onNFTCreated={(nftData) => {
          console.log('NFT Created for project:', nftData);
          setGeneratedNFT(nftData);
          setShowNFTModal(true);
        }}
        onMintNFT={(nftData) => {
          console.log('Minting NFT for project:', nftData);
          setGeneratedNFT({ ...nftData, minting: true });
          handleMint();
        }}
        className="mb-8"
      />

      {/* Revenue Chart */}
      <RevenueChart 
        title="Revenue Over Time" 
        type="line"
        data={[
          { month: 'Jan', revenue: 2500 },
          { month: 'Feb', revenue: 3200 },
          { month: 'Mar', revenue: 2800 },
          { month: 'Apr', revenue: 4100 },
          { month: 'May', revenue: 3800 },
          { month: 'Jun', revenue: 5200 }
        ]}
      />

      {/* Projects Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Your Projects</h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200">
              All
            </button>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200">
              Active
            </button>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200">
              Completed
            </button>
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                isOwner={true} 
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">No projects yet</h4>
            <p className="text-gray-300 mb-6">Create your first project to start earning revenue</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Create Your First Project
            </button>
          </div>
        )}
      </div>

      {/* Revenue Distribution Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6">Revenue Distribution</h3>
        
        {/* Wallet Connection */}
        {!isConnected ? (
          <div className="text-center mb-6">
            <p className="mb-4 text-gray-300">Connect your wallet to manage revenue distribution</p>
            <button
              onClick={() => connect({ connector: injected() })}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connected Wallet Info */}
            <div className="p-4 bg-gray-900/50 rounded-lg text-center border border-gray-700">
              <p className="text-sm text-gray-400">Connected as:</p>
              <p className="font-mono break-all text-xs text-green-400">{address}</p>
              {chainId !== 80002 && (
                <div className="mt-2 p-2 bg-yellow-600/20 border border-yellow-500 rounded text-yellow-300 text-xs">
                  ⚠️ Please switch to Polygon Amoy testnet (Chain ID: 80002)
                </div>
              )}
            </div>

            {/* NFT Minting */}
            <div className="space-y-4 bg-gray-900/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-gray-200">Mint NFT</h4>
              <div className="flex items-center justify-between text-gray-300">
                <span className="text-lg">NFTs Minted:</span>
                <span className="text-lg font-bold">
                  {totalSupply} / {maxSupply || '—'}
                </span>
              </div>
              <button
                onClick={handleMint}
                disabled={!isConnected || isPending || (maxSupply ? totalSupply >= maxSupply : false)}
                className="w-full px-4 py-3 font-semibold text-lg bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Mint NFT (demo: free)
              </button>
            </div>

            {/* Revenue Deposit */}
            <div className="space-y-4 bg-gray-900/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-gray-200">Deposit Revenue</h4>
              <div className="space-y-3">
                <input
                  type="number"
                  value={revenueAmount}
                  onChange={(e) => setRevenueAmount(e.target.value)}
                  placeholder="Enter USDC amount to distribute"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleDepositRevenue}
                  disabled={!isConnected || !revenueAmount || isPending}
                  className="w-full px-4 py-3 font-semibold text-lg bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Deposit Revenue
                </button>
              </div>
            </div>

            {/* Revenue Claiming */}
            <div className="space-y-4 bg-gray-900/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-semibold text-gray-200">Claim Revenue</h4>
              <div className="space-y-3">
                <input
                  type="number"
                  value={tokenIdToClaim}
                  onChange={(e) => setTokenIdToClaim(e.target.value)}
                  placeholder="Enter your NFT Token ID to claim"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                {claimableUSDC && (
                  <p className="text-green-400 font-semibold">Claimable: {claimableUSDC}</p>
                )}
                <button
                  onClick={handleClaimRevenue}
                  disabled={!isConnected || !tokenIdToClaim || isPending}
                  className="w-full px-4 py-3 font-semibold text-lg bg-teal-600 rounded-lg hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Claim Your Share
                </button>
              </div>
            </div>

            {/* Transaction Status */}
            <div className="h-16">
              {isPending && (
                <div className="p-4 bg-blue-600/30 border border-blue-500 rounded-lg text-center animate-pulse">
                  Check your wallet…
                </div>
              )}
              {isConfirmed && (
                <div className="p-4 bg-green-600/30 border border-green-500 rounded-lg text-center">
                  Transaction successful!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recent Investments */}
      {recent_investments && recent_investments.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6">Recent Investments</h3>
          <div className="space-y-4">
            {recent_investments.map((investment) => (
              <div key={investment.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold">${investment.amount.toLocaleString()} Investment</p>
                    <p className="text-gray-300 text-sm">Token ID: {investment.nft_token_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">+${investment.amount.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(investment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      )}

      {/* NFT Details Modal */}
      <NFTDetailsModal
        nft={generatedNFT}
        isOpen={showNFTModal}
        onClose={() => setShowNFTModal(false)}
        onMint={(nftData) => {
          setGeneratedNFT({ ...nftData, minting: true });
          handleMint();
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
                  <h3 className="text-xl font-bold text-white mb-2">Transaction Successful!</h3>
                  <p className="text-gray-300">Your transaction has been confirmed on the blockchain</p>
                </>
              )}
              {transactionStatus === 'error' && (
                <>
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Transaction Failed</h3>
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

export default CreatorDashboard;
