'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import CreatorDashboard from '@/components/CreatorDashboard';
import InvestorDashboard from '@/components/InvestorDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';
import BlockchainActions from '@/components/BlockchainActions';
import ProfileDropdown from '@/components/ProfileDropdown';
import NFTMarketplace from '@/components/NFTMarketplace';

const Dashboard = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const api = useApi();
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchDashboardData();
    }
  }, [user, isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      const endpoint = user.role === 'creator' 
        ? `/creator/${user.id}/dashboard` 
        : `/investor/${user.id}/dashboard`;
      
      const data = await api.get(endpoint);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                FlowMint
              </h1>
              <div className="hidden md:block">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300">
                  {user.role === 'creator' ? 'Creator' : 'Investor'} Dashboard
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="/home"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Discover Projects</span>
              </a>
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-0">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-lg rounded-lg p-1 border border-white/20 w-fit">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-3 rounded-md transition-all duration-200 font-semibold ${
                activeTab === 'projects'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Projects</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('nfts')}
              className={`px-6 py-3 rounded-md transition-all duration-200 font-semibold ${
                activeTab === 'nfts'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>NFTs</span>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dashboard Content */}
          <div className="lg:col-span-2">
            {activeTab === 'projects' ? (
              user.role === 'creator' ? (
                <CreatorDashboard data={dashboardData} onRefresh={fetchDashboardData} />
              ) : (
                <InvestorDashboard data={dashboardData} onRefresh={fetchDashboardData} />
              )
            ) : (
              <NFTMarketplace />
            )}
          </div>
          
          {/* Blockchain Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-2xl font-bold text-white mb-6">Blockchain Actions</h2>
              <BlockchainActions userRole={user.role} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
