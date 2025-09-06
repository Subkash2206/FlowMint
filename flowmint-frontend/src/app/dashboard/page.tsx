'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import CreatorDashboard from '@/components/CreatorDashboard';
import InvestorDashboard from '@/components/InvestorDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';
import BlockchainActions from '@/components/BlockchainActions';

const Dashboard = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const api = useApi();
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

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
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
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
              <div className="text-right">
                <p className="text-sm text-gray-300">Welcome back,</p>
                <p className="font-semibold text-white">{user.username || user.wallet_address.slice(0, 6)}...</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {(user.username || user.wallet_address).charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dashboard Content */}
          <div className="lg:col-span-2">
            {user.role === 'creator' ? (
              <CreatorDashboard data={dashboardData} onRefresh={fetchDashboardData} />
            ) : (
              <InvestorDashboard data={dashboardData} onRefresh={fetchDashboardData} />
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
