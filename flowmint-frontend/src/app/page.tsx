'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useAccount,
  useConnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseUnits, formatUnits } from 'viem';

// --- ABIs (from your Hardhat artifacts; MUST be fresh) ---
import distributorArtifact from '@/lib/abi/RevenueDistributor.json';
import nftArtifact from '@/lib/abi/FlowMintNFT.json';

// Minimal ERC20 ABI (approve/allowance/balance)
const erc20Abi = [
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool', name: '' }] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256', name: '' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8', name: '' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256', name: '' }] },
];

// --- CONTRACT ADDRESSES (update these) ---
const revenueDistributorAddress = '0x3a4E9Fa1D8cE4Ee6b75Ef498903eBc8C1E92e507';
const flowmintNftAddress = '0x417D69F9E27e2184AC89C6Ef4206242E65A685FD';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { writeContract, writeContractAsync, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const [isClient, setIsClient] = useState(false);
  const [revenueAmount, setRevenueAmount] = useState(''); // human-readable USDC (e.g., "25.5")
  const [tokenIdToClaim, setTokenIdToClaim] = useState('');

  useEffect(() => setIsClient(true), []);

  // --- ABI presence sanity check (prevents "Function not found" confusion) ---
  const distributorAbi = distributorArtifact.abi;
  const hasDepositRevenue = useMemo(
    () => distributorAbi.some((f) => f.type === 'function' && f.name === 'depositRevenue'),
    [distributorAbi]
  );

  // --- READS ---
  // Pull USDC address from contract (since it's immutable public)
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

  // --- ACTIONS ---
  // Mint is "free for demo" per your Solidity (USDC transfer commented out)
  const handleMint = () => {
    const mockTokenURI = `https://example.com/nft/${totalSupply + 1}.json`;
    writeContract({
      address: revenueDistributorAddress,
      abi: distributorAbi,
      functionName: 'mint',
      args: [mockTokenURI],
      // NOTE: no "value" here — mint() doesn't accept native MATIC in your contract
    });
  };

  // Approve USDC for the distributor to pull
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

  // Deposit revenue (USDC) — requires ABI to have depositRevenue(uint256)
  const handleDepositRevenue = async () => {
    if (!hasDepositRevenue) {
      console.error('ABI missing depositRevenue. Replace your JSON with the freshly compiled artifact.');
      alert('Your frontend ABI is stale. Rebuild & replace RevenueDistributor.json (see console).');
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

  useEffect(() => {
    if (isConfirmed) {
      refetchSupply();
      refetchClaimable();
    }
  }, [isConfirmed, refetchSupply, refetchClaimable]);

  if (!isClient) return null;

  // Claimable formatted as USDC
  const claimableUSDC = claimableRaw ? `${formatUnits(claimableRaw, 6)} USDC` : null;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-gray-900 text-white font-sans">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl shadow-purple-500/10 p-6 sm:p-8 space-y-8 border border-gray-700">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            FlowMint
          </h1>
          <p className="text-gray-400 mt-2">Tokenize Your Future Revenue</p>
          <div className="mt-4 space-x-4">
            <a
              href="/login"
              className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
            >
              Login / Register
            </a>
            <a
              href="/home"
              className="inline-block px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
            >
              Browse Projects
            </a>
          </div>
        </div>

        {!isConnected ? (
          <div className="text-center">
            <p className="mb-6 text-gray-300">Connect your wallet to interact with smart contracts</p>
            <button
              onClick={() => connect({ connector: injected() })}
              className="w-full px-4 py-3 font-semibold text-lg bg-purple-600 rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="p-4 bg-gray-900/50 rounded-lg text-center border border-gray-700">
            <p className="text-sm text-gray-400">Connected as:</p>
            <p className="font-mono break-all text-xs text-green-400">{address}</p>
          </div>
        )}

        {/* MINT */}
        <section className="space-y-4 bg-gray-900/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl sm:text-2xl font-semibold border-b border-gray-600 pb-2 text-gray-200">
            Invest in a Creator
          </h2>
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
        </section>

        {/* CREATOR */}
        <section className="space-y-4 bg-gray-900/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl sm:text-2xl font-semibold border-b border-gray-600 pb-2 text-gray-200">
            For Creators (USDC)
          </h2>
          {!hasDepositRevenue && (
            <div className="p-3 rounded bg-red-900/30 border border-red-700 text-sm">
              ABI missing <code>depositRevenue</code>. Replace <code>RevenueDistributor.json</code> in your frontend with the latest artifact.
            </div>
          )}
          <div className="text-sm text-gray-400">
            USDC token: <span className="font-mono">{usdcAddress ?? '—'}</span>
          </div>
          <input
            type="number"
            value={revenueAmount}
            onChange={(e) => setRevenueAmount(e.target.value)}
            placeholder="Enter revenue amount in USDC (e.g., 25.5)"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleApproveUSDC}
              disabled={!isConnected || isPending || !revenueAmount}
              className="w-full px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Approve USDC
            </button>
            <button
              onClick={handleDepositRevenue}
              disabled={!isConnected || isPending || !revenueAmount || !hasDepositRevenue}
              className="w-full px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Deposit Revenue
            </button>
          </div>
        </section>

        {/* INVESTOR */}
        <section className="space-y-4 bg-gray-900/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl sm:text-2xl font-semibold border-b border-gray-600 pb-2 text-gray-200">
            For Investors
          </h2>
          <input
            type="number"
            value={tokenIdToClaim}
            onChange={(e) => {
              setTokenIdToClaim(e.target.value);
            }}
            placeholder="Enter your NFT Token ID to claim"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
          />
          {claimableUSDC && (
            <p className="text-center text-gray-400">
              You can claim:&nbsp;<span className="font-bold text-green-400">{claimableUSDC}</span>
            </p>
          )}
          <button
            onClick={handleClaimRevenue}
            disabled={!isConnected || isPending || !tokenIdToClaim}
            className="w-full px-4 py-2 bg-teal-600 rounded-lg hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Claim Your Share
          </button>
        </section>

        {/* STATUS */}
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
    </main>
  );
}
