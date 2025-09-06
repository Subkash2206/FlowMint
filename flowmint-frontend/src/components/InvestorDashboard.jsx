'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InvestmentCard from './InvestmentCard';
import ProjectCard from './ProjectCard';
import StatsCard from './StatsCard';

const InvestorDashboard = ({ data, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('investments');
  const router = useRouter();

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
        <p className="mt-4 text-gray-300">Loading dashboard...</p>
      </div>
    );
  }

  const { user, investments, total_invested, total_projects, recent_revenue } = data;

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
              Track your investments and discover new opportunities
            </p>
          </div>
          <button 
            onClick={() => router.push('/home')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Discover Projects</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Invested"
          value={`$${total_invested.toLocaleString()}`}
          icon="💎"
          color="from-blue-500 to-cyan-500"
          change="+8%"
        />
        <StatsCard
          title="Active Investments"
          value={investments.length}
          icon="📈"
          color="from-green-500 to-emerald-500"
          change="+3"
        />
        <StatsCard
          title="Projects Supported"
          value={total_projects}
          icon="🎯"
          color="from-purple-500 to-pink-500"
          change="+1"
        />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('investments')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'investments'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            My Investments
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'discover'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Discover Projects
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'revenue'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Revenue History
          </button>
        </div>

        {/* Investments Tab */}
        {activeTab === 'investments' && (
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Your Investments</h3>
            {investments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investments.map((investment) => (
                  <InvestmentCard key={investment.id} investment={investment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No investments yet</h4>
                <p className="text-gray-300 mb-6">Start investing in creators to earn returns</p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Discover Projects
                </button>
              </div>
            )}
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Discover Projects</h3>
              <button 
                onClick={() => router.push('/home')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>View All Projects</span>
              </button>
            </div>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Explore All Projects</h4>
              <p className="text-gray-300 mb-6">Discover and invest in amazing creator projects</p>
              <button 
                onClick={() => router.push('/home')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Browse All Projects
              </button>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Revenue History</h3>
            {recent_revenue && recent_revenue.length > 0 ? (
              <div className="space-y-4">
                {recent_revenue.map((revenue, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Revenue Distribution</p>
                        <p className="text-gray-300 text-sm">From project earnings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">+$0.00</p>
                      <p className="text-gray-400 text-sm">No revenue yet</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No revenue yet</h4>
                <p className="text-gray-300">Revenue will appear here when your investments start earning</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorDashboard;
