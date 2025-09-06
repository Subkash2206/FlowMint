'use client';

import React, { useState, useMemo } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import distributorArtifact from '@/lib/abi/RevenueDistributor.json';

// Minimal ERC20 ABI (approve/allowance/balance)
const erc20Abi = [
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool', name: '' }] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256', name: '' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8', name: '' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256', name: '' }] },
];

const revenueDistributorAddress = '0x3a4E9Fa1D8cE4Ee6b75Ef498903eBc8C1E92e507';

const BlockchainActions = ({ userRole }) => {
  const { address, isConnected } = useAccount();
  const { writeContract, writeContractAsync, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const [revenueAmount, setRevenueAmount] = useState('');
  const [tokenIdToClaim, setTokenIdToClaim] = useState('');

  const distributorAbi = distributorArtifact.abi;
  const hasDepositRevenue = useMemo(
    () => distributorAbi.some((f) => f.type === 'function' && f.name === 'depositRevenue'),
    [distributorAbi]
  );

  // Pull USDC address from contract
  const { data: usdcAddressData } = useReadContract({
    address: revenueDistributorAddress,
    abi: distributorAbi,
    functionName: 'usdcToken',
  });
  const usdcAddress = usdcAddressData;

  // Distributor totals
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
  const totalSupply = Number(totalSupplyData ?? BigInt(0));
  const maxSupply = Number(maxSupplyData ?? BigInt(0));

  // Claimable (USDC, 6 decimals)
  const { data: claimableRaw, refetch: refetchClaimable } = useReadContract({
    address: revenueDistributorAddress,
    abi: distributorAbi,
    functionName: 'getClaimableRevenue',
    args: [tokenIdToClaim ? BigInt(tokenIdToClaim) : BigInt(0)],
    query: { enabled: !!tokenIdToClaim },
  });

  // Actions
  const handleMint = () => {
    const mockTokenURI = `https://example.com/nft/${totalSupply + 1}.json`;
    writeContract({
      address: revenueDistributorAddress,
      abi: distributorAbi,
      functionName: 'mint',
      args: [mockTokenURI],
    });
  };

  const handleApproveUSDC = async () => {
    if (!usdcAddress || !isConnected) return;
    if (!revenueAmount || Number(revenueAmount) <= 0) return;

    const amount = parseUnits(revenueAmount, 6); // USDC = 6 decimals
    await writeContractAsync({
      address: usdcAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [revenueDistributorAddress, amount],
    });
  };

  const handleDepositRevenue = async () => {
    if (!hasDepositRevenue) {
      alert('ABI missing depositRevenue function. Please check contract deployment.');
      return;
    }
    if (!revenueAmount || Number(revenueAmount) <= 0) {
      alert('Enter a valid USDC amount.');
      return;
    }
    const amount = parseUnits(revenueAmount, 6);
    await writeContractAsync({
      address: revenueDistributorAddress,
      abi: distributorAbi,
      functionName: 'depositRevenue',
      args: [amount],
    });
  };

  const handleClaimRevenue = () => {
    if (!tokenIdToClaim) return;
    writeContract({
      address: revenueDistributorAddress,
      abi: distributorAbi,
      functionName: 'claimRevenue',
      args: [BigInt(tokenIdToClaim)],
    });
  };

  const claimableUSDC = claimableRaw ? `${formatUnits(claimableRaw, 6)} USDC` : null;

  if (!isConnected) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet Required</h3>
          <p className="text-gray-300">Connect your wallet to interact with smart contracts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mint NFT Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Mint NFT (Investment)
        </h3>
        <div className="flex items-center justify-between text-gray-300 mb-4">
          <span>NFTs Minted:</span>
          <span className="font-bold text-white">
            {totalSupply} / {maxSupply || '∞'}
          </span>
        </div>
        <button
          onClick={handleMint}
          disabled={isPending || (maxSupply ? totalSupply >= maxSupply : false)}
          className="w-full px-4 py-3 bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
        >
          {isPending ? 'Minting...' : 'Mint NFT (Free Demo)'}
        </button>
      </div>

      {/* Creator Actions */}
      {userRole === 'creator' && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <svg className="w-6 h-6 text-orange-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Deposit Revenue (USDC)
          </h3>
          {!hasDepositRevenue && (
            <div className="p-3 rounded bg-red-900/30 border border-red-700 text-sm mb-4">
              ABI missing <code>depositRevenue</code> function
            </div>
          )}
          <div className="text-sm text-gray-400 mb-4">
            USDC token: <span className="font-mono">{usdcAddress ?? 'Loading...'}</span>
          </div>
          <input
            type="number"
            value={revenueAmount}
            onChange={(e) => setRevenueAmount(e.target.value)}
            placeholder="Enter revenue amount in USDC (e.g., 25.5)"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all mb-4"
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleApproveUSDC}
              disabled={isPending || !revenueAmount}
              className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Approve USDC
            </button>
            <button
              onClick={handleDepositRevenue}
              disabled={isPending || !revenueAmount || !hasDepositRevenue}
              className="px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Deposit Revenue
            </button>
          </div>
        </div>
      )}

      {/* Investor Actions */}
      {userRole === 'investor' && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <svg className="w-6 h-6 text-teal-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Claim Revenue
          </h3>
          <input
            type="number"
            value={tokenIdToClaim}
            onChange={(e) => setTokenIdToClaim(e.target.value)}
            placeholder="Enter your NFT Token ID to claim"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all mb-4"
          />
          {claimableUSDC && (
            <p className="text-center text-gray-400 mb-4">
              You can claim: <span className="font-bold text-green-400">{claimableUSDC}</span>
            </p>
          )}
          <button
            onClick={handleClaimRevenue}
            disabled={isPending || !tokenIdToClaim}
            className="w-full px-4 py-2 bg-teal-600 rounded-lg hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Claim Your Share
          </button>
        </div>
      )}

      {/* Transaction Status */}
      <div className="h-16">
        {isPending && (
          <div className="p-4 bg-blue-600/30 border border-blue-500 rounded-lg text-center animate-pulse">
            Check your wallet…
          </div>
        )}
        {isConfirming && (
          <div className="p-4 bg-yellow-600/30 border border-yellow-500 rounded-lg text-center animate-pulse">
            Waiting for confirmation…
          </div>
        )}
        {isConfirmed && (
          <div className="p-4 bg-green-600/30 border border-green-500 rounded-lg text-center">
            Transaction successful!
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-600/30 border border-red-500 rounded-lg text-center">
            <p className="text-xs break-all">Error: {error?.shortMessage || error?.message || 'Unknown error'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainActions;
