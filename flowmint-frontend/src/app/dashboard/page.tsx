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
