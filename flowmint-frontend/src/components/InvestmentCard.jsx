'use client';

import React from 'react';

const InvestmentCard = ({ investment }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
          investment.status === 'active' 
            ? 'text-green-400 bg-green-500/20' 
            : 'text-gray-400 bg-gray-500/20'
        }`}>
          {investment.status || 'Active'}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">
            {investment.project_name || `Investment #${investment.nft_token_id}`}
          </h3>
          <p className="text-gray-300 text-sm">
            by {investment.project_creator || 'Unknown Creator'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300 text-sm">Amount</span>
            <span className="text-white font-semibold">
              ${investment.amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300 text-sm">Date</span>
            <span className="text-gray-300 text-sm">
              {new Date(investment.created_at).toLocaleDateString()}
            </span>
          </div>
          {investment.transaction_hash && (
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm">Transaction</span>
              <span className="text-blue-400 text-sm font-mono">
                {investment.transaction_hash.slice(0, 8)}...
              </span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400 text-sm font-semibold">
                Earning Revenue
              </span>
            </div>
            <button className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 transition-colors duration-200">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCard;
