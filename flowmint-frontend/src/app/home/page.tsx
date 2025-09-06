'use client';

import React, { useState, useEffect } from "react";
import ProjectCard from "@/components/ProjectCard";
import { useApi } from "@/hooks/useApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import distributorArtifact from '@/lib/abi/RevenueDistributor.json';

const Home = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMintSection, setShowMintSection] = useState(false);
  const api = useApi();
  const { user } = useAuth();
  
  // Web3 hooks
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { writeContract, writeContractAsync, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });
  
  // Contract data
  const revenueDistributorAddress = '0x3a4E9Fa1D8cE4Ee6b75Ef498903eBc8C1E92e507';
  const distributorAbi = distributorArtifact.abi;
  
  // Get total supply
  const { data: totalSupplyData } = useReadContract({
    address: revenueDistributorAddress,
    abi: distributorAbi,
    functionName: 'totalSupply',
  });
  const { data: maxSupplyData } = useReadContract({
    address: revenueDistributorAddress,
    abi: distributorAbi,
    functionName: 'maxSupply',
  });
  const totalSupply = Number(totalSupplyData ?? BigInt(0));
  const maxSupply = Number(maxSupplyData ?? BigInt(0));

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    try {
      const mockTokenURI = `https://example.com/nft/${totalSupply + 1}.json`;
      await writeContractAsync({
        address: revenueDistributorAddress,
        abi: distributorAbi,
        functionName: 'mint',
        args: [mockTokenURI],
        gas: 500000n,
      });
    } catch (error) {
      console.error('Mint error:', error);
      if (error.message?.includes('User rejected')) {
        alert('Transaction was cancelled by user.');
      } else if (error.message?.includes('insufficient funds')) {
        alert('Insufficient funds for gas. Please add MATIC to your wallet.');
      } else {
        alert('Minting failed. Please check your wallet connection and try again.');
      }
    }
  };

  const filtered = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase()) ||
                         project.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || project.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: "all", name: "All Projects" },
    { id: "art", name: "Art" },
    { id: "music", name: "Music" },
    { id: "tech", name: "Technology" },
    { id: "gaming", name: "Gaming" },
  ];

  if (loading) {
    return <LoadingSpinner text="Loading projects..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                FlowMint
              </h1>
              <span className="hidden md:block text-gray-300">Discover Projects</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search projects..."
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {user?.role === 'investor' && (
                <button
                  onClick={() => setShowMintSection(!showMintSection)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Mint NFT</span>
                </button>
              )}
              <a
                href="/dashboard"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Dashboard</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mint NFT Section for Investors */}
        {showMintSection && user?.role === 'investor' && (
          <div className="mb-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Mint Investment NFT</h2>
              <button
                onClick={() => setShowMintSection(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {!isConnected ? (
              <div className="text-center py-8">
                <p className="text-gray-300 mb-4">Connect your wallet to mint an NFT</p>
                <button
                  onClick={() => connect({ connector: injected() })}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-gray-300">
                  <span className="text-lg">NFTs Minted:</span>
                  <span className="text-lg font-bold">
                    {totalSupply} / {maxSupply || '∞'}
                  </span>
                </div>
                <button
                  onClick={handleMint}
                  disabled={isPending || (maxSupply ? totalSupply >= maxSupply : false)}
                  className="w-full px-4 py-3 font-semibold text-lg bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {isPending ? 'Minting...' : 'Mint NFT (Free Demo)'}
                </button>
                {chainId !== 80002 && (
                  <div className="p-3 bg-yellow-600/20 border border-yellow-500 rounded text-yellow-300 text-sm">
                    ⚠️ Please switch to Polygon Amoy testnet (Chain ID: 80002)
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">Categories</h2>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setCategory(cat.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                        category === cat.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {category === "all" ? "All Projects" : `${categories.find(c => c.id === category)?.name}`}
              </h2>
              <p className="text-gray-300">
                {filtered.length} project{filtered.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No projects found</h4>
                <p className="text-gray-300">
                  {search ? 'Try adjusting your search terms' : 'No projects in this category yet'}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
