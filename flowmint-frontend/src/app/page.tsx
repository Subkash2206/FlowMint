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
import { parseUnits, formatUnits, getContract } from 'viem';

// --- ABIs (from your Hardhat artifacts; MUST be fresh) ---
import distributorArtifact from '@/lib/abi/RevenueDistributor.json';
import nftArtifact from '@/lib/abi/FlowMintNFT.json';

// --- New Components ---
import FeaturedProjects from '@/components/FeaturedProjects';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import PixelArtNFTGenerator from '@/components/PixelArtNFTGenerator';
import NFTDetailsModal from '@/components/NFTDetailsModal';

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
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { writeContract, writeContractAsync, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const [isClient, setIsClient] = useState(false);
  const [revenueAmount, setRevenueAmount] = useState(''); // human-readable USDC (e.g., "25.5")
  const [tokenIdToClaim, setTokenIdToClaim] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [generatedNFT, setGeneratedNFT] = useState(null);
  const [showNFTModal, setShowNFTModal] = useState(false);

  useEffect(() => setIsClient(true), []);

  // --- ABI presence sanity check (prevents "Function not found" confusion) ---
  const distributorAbi = distributorArtifact.abi;
  const hasDepositRevenue = useMemo(
    () => distributorAbi.some((f) => f.type === 'function' && f.name === 'depositRevenue'),
    [distributorAbi]
  );

  // --- READS ---
  // Use a mock USDC address for demo purposes
  const usdcAddress = '0xA0b86a33E6441b8c4C8C0C4C0C4C0C4C0C4C0C4C'; // Mock USDC address

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
    args: tokenIdToClaim ? [BigInt(tokenIdToClaim)] : undefined,
    query: { enabled: !!tokenIdToClaim },
  });

  // Mock allowance data for demo
  const allowanceData = BigInt(0); // Mock: no allowance initially

  // --- ACTIONS ---
  // Mint is "free for demo" per your Solidity (USDC transfer commented out)
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
        gas: 500000n, // Add gas limit
        // NOTE: no "value" here — mint() doesn't accept native MATIC in your contract
      });
      
      setTransactionHash(hash);
      setTransactionStatus('confirming');
    } catch (error: any) {
      console.error('Mint error:', error);
      setTransactionStatus('error');
      if (error?.message?.includes('User rejected')) {
        alert('Transaction was cancelled by user.');
      } else if (error?.message?.includes('insufficient funds')) {
        alert('Insufficient funds for gas. Please add MATIC to your wallet.');
      } else {
        alert('Minting failed. Please check your wallet connection and try again.');
      }
    }
  };

  // Approve USDC for the distributor to pull
  const handleApproveUSDC = async () => {
    if (!usdcAddress || !isConnected) return;
    if (!revenueAmount || Number(revenueAmount) <= 0) return;

    try {
      setShowTransactionModal(true);
      setTransactionStatus('pending');
      setTransactionHash('');
      
      const amount = parseUnits(revenueAmount, 6); // USDC = 6 decimals
      const hash = await writeContractAsync({
        address: usdcAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [revenueDistributorAddress, amount],
        gas: 100000n, // Add gas limit
      });
      
      setTransactionHash(hash);
      setTransactionStatus('confirming');
    } catch (error: any) {
      console.error('Approve error:', error);
      setTransactionStatus('error');
      if (error?.message?.includes('User rejected')) {
        alert('Transaction was cancelled by user.');
      } else if (error?.message?.includes('insufficient funds')) {
        alert('Insufficient funds for gas. Please add MATIC to your wallet.');
      } else {
        alert('USDC approval failed. Please try again.');
      }
    }
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
    if (!usdcAddress) {
      alert('USDC address not found. Please check contract deployment.');
      return;
    }
    
    try {
      setShowTransactionModal(true);
      setTransactionStatus('pending');
      setTransactionHash('');
      
      const amount = parseUnits(revenueAmount, 6);
      
      // Check if we need to approve USDC
      if (allowanceData && allowanceData < amount) {
        alert('Please approve USDC first before depositing revenue.');
        setShowTransactionModal(false);
        return;
      }
      
      const hash = await writeContractAsync({
        address: revenueDistributorAddress,
        abi: distributorAbi,
        functionName: 'depositRevenue',
        args: [amount],
        gas: 300000n, // Add gas limit
      });
      
      setTransactionHash(hash);
      setTransactionStatus('confirming');
    } catch (error: any) {
      console.error('Deposit error:', error);
      setTransactionStatus('error');
      if (error?.message?.includes('User rejected')) {
        alert('Transaction was cancelled by user.');
      } else if (error?.message?.includes('insufficient funds')) {
        alert('Insufficient funds for gas. Please add MATIC to your wallet.');
      } else if (error?.message?.includes('allowance')) {
        alert('Please approve USDC first before depositing revenue.');
      } else {
        alert('Transaction failed. Please check your USDC balance and approval.');
      }
    }
  };

  const handleClaimRevenue = async () => {
    if (!tokenIdToClaim) return;
    try {
      setShowTransactionModal(true);
      setTransactionStatus('pending');
      setTransactionHash('');
      
      const hash = await writeContractAsync({
        address: revenueDistributorAddress,
        abi: distributorAbi,
        functionName: 'claimRevenue',
        args: [BigInt(tokenIdToClaim)],
        gas: 200000n, // Add gas limit
      });
      
      setTransactionHash(hash);
      setTransactionStatus('confirming');
    } catch (error: any) {
      console.error('Claim error:', error);
      setTransactionStatus('error');
      if (error?.message?.includes('User rejected')) {
        alert('Transaction was cancelled by user.');
      } else if (error?.message?.includes('insufficient funds')) {
        alert('Insufficient funds for gas. Please add MATIC to your wallet.');
      } else {
        alert('Claim failed. Please check your token ID and try again.');
      }
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      setTransactionStatus('success');
      refetchSupply();
      refetchClaimable();
    }
  }, [isConfirmed, refetchSupply, refetchClaimable]);

  if (!isClient) return null;

  // Claimable formatted as USDC
  const claimableUSDC = claimableRaw ? `${formatUnits(claimableRaw, 6)} USDC` : null;

  return (
    <main className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
        {/* Back Button */}
        <div className="w-full max-w-2xl mb-4">
          <button
            onClick={() => window.location.href = '/login'}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Login</span>
          </button>
        </div>
        
        <div className="w-full max-w-4xl bg-gradient-to-br from-gray-800/90 via-purple-900/20 to-pink-900/20 rounded-3xl shadow-2xl shadow-purple-500/20 p-8 sm:p-12 space-y-12 border border-purple-500/30 backdrop-blur-xl">
        <div className="text-center relative">
          {/* Animated background elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>
          
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-violet-400 mb-6 tracking-tight">
            FlowMint
          </h1>
          <div className="relative">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400 mb-8">
              Tokenize Your Future Revenue
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </div>
          
          <p className="text-xl sm:text-2xl lg:text-3xl text-gray-200 mt-12 max-w-4xl mx-auto leading-relaxed font-light">
            The <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Revolutionary Platform</span> Where Creators Tokenize Their Future Revenue
          </p>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mt-8 max-w-4xl mx-auto leading-relaxed">
            FlowMint transforms how creators and investors connect by enabling <span className="font-semibold text-blue-400">revenue-sharing NFTs</span>. 
            Creators can raise capital by selling shares of their future earnings, while investors 
            get <span className="font-semibold text-green-400">direct access to creator revenue streams</span> through blockchain technology.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-2xl p-6 border border-green-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold text-green-400 mb-2">Decentralized Revenue Sharing</h3>
              <p className="text-sm text-gray-300">Automated, transparent distribution of creator earnings to investors</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 rounded-2xl p-6 border border-blue-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold text-blue-400 mb-2">Smart Contract Automation</h3>
              <p className="text-sm text-gray-300">Trustless execution of revenue distribution through blockchain</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-violet-600/10 rounded-2xl p-6 border border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold text-purple-400 mb-2">Transparent & Trustless</h3>
              <p className="text-sm text-gray-300">Complete transparency with immutable blockchain records</p>
            </div>
          </div>
          <div className="mt-16 space-y-8">
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a
                href="/login"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 hover:from-purple-700 hover:via-pink-700 hover:to-violet-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-2xl shadow-purple-500/30 font-bold text-lg min-w-[200px]"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </a>
              <a
                href="/home"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-2xl shadow-white/10 font-bold text-lg border-2 border-white/30 hover:border-white/50 backdrop-blur-sm min-w-[200px]"
              >
                <span className="relative z-10">Browse Projects</span>
                <div className="absolute inset-0 bg-white/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-base mb-6 font-medium">Choose your role:</p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-6">
                <a
                  href="/login?role=creator"
                  className="group relative inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 text-green-300 rounded-xl transition-all duration-300 text-base font-semibold border-2 border-green-500/40 hover:border-green-400/60 backdrop-blur-sm min-w-[140px] hover:scale-105"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Creator</span>
                  </span>
                  <div className="absolute inset-0 bg-green-400/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
                <a
                  href="/login?role=investor"
                  className="group relative inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 text-blue-300 rounded-xl transition-all duration-300 text-base font-semibold border-2 border-blue-500/40 hover:border-blue-400/60 backdrop-blur-sm min-w-[140px] hover:scale-105"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                    <span>Investor</span>
                  </span>
                  <div className="absolute inset-0 bg-blue-400/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              </div>
            </div>
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
            {chainId !== 80002 && (
              <div className="mt-2 p-2 bg-yellow-600/20 border border-yellow-500 rounded text-yellow-300 text-xs">
                ⚠️ Please switch to Polygon Amoy testnet (Chain ID: 80002)
              </div>
            )}
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

        {/* PIXEL ART NFT GENERATOR */}
        <PixelArtNFTGenerator 
          onNFTCreated={(nftData: any) => {
            console.log('NFT Created:', nftData);
            setGeneratedNFT(nftData);
            setShowNFTModal(true);
          }}
          onMintNFT={(nftData: any) => {
            console.log('Minting NFT with data:', nftData);
            // Set minting status and call handleMint
            setGeneratedNFT({ ...nftData, minting: true });
            handleMint();
          }}
        />

        {/* CREATOR */}
        <section className="space-y-4 bg-gray-900/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl sm:text-2xl font-semibold border-b border-gray-600 pb-2 text-gray-200">
            For Creators (Revenue Distribution)
          </h2>
          <div className="text-sm text-gray-400 mb-4">
            Fans pay you real money for NFTs/tokens → You distribute that revenue to investors
          </div>
          <input
            type="number"
            value={revenueAmount}
            onChange={(e) => setRevenueAmount(e.target.value)}
            placeholder="Enter revenue received from fans (e.g., 25.5)"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleApproveUSDC}
              disabled={!isConnected || isPending || !revenueAmount}
              className="w-full px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Approve Revenue
            </button>
            <button
              onClick={handleDepositRevenue}
              disabled={!isConnected || isPending || !revenueAmount}
              className="w-full px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Distribute to Investors
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
              <p className="text-xs break-all">Error: {(error as any)?.shortMessage || (error as any)?.message || 'Unknown error'}</p>
            </div>
          )}
        </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <FeaturedProjects />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Testimonials Section */}
      <Testimonials />

      {/* NFT Details Modal */}
      <NFTDetailsModal
        nft={generatedNFT}
        isOpen={showNFTModal}
        onClose={() => setShowNFTModal(false)}
        onMint={(nftData: any) => {
          setGeneratedNFT({ ...nftData, minting: true });
          handleMint();
        }}
      />

      {/* Transaction Confirmation Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-md w-full">
            <div className="text-center">
              {transactionStatus === 'pending' && (
                <>
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Transaction Pending</h3>
                  <p className="text-gray-300">Please confirm the transaction in your wallet...</p>
                </>
              )}
              
              {transactionStatus === 'confirming' && (
                <>
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Confirming Transaction</h3>
                  <p className="text-gray-300">Waiting for blockchain confirmation...</p>
                  {transactionHash && (
                    <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Transaction Hash:</p>
                      <p className="text-xs text-gray-300 font-mono break-all">
                        {transactionHash}
                      </p>
                    </div>
                  )}
                </>
              )}
              
              {transactionStatus === 'success' && (
                <>
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Transaction Successful!</h3>
                  <p className="text-gray-300">Your transaction has been confirmed on the blockchain.</p>
                  {transactionHash && (
                    <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Transaction Hash:</p>
                      <p className="text-xs text-gray-300 font-mono break-all">
                        {transactionHash}
                      </p>
                    </div>
                  )}
                </>
              )}
              
              {transactionStatus === 'error' && (
                <>
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Transaction Failed</h3>
                  <p className="text-gray-300">There was an error processing your transaction.</p>
                </>
              )}
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="flex-1 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  {transactionStatus === 'success' ? 'Close' : 'Cancel'}
                </button>
                {transactionStatus === 'success' && (
                  <button
                    onClick={() => {
                      setShowTransactionModal(false);
                      // Refresh the page to show updated data
                      window.location.reload();
                    }}
                    className="flex-1 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Refresh
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-2xl mt-8 text-center">
        <div className="text-gray-400 text-sm space-y-2">
          <p>Built on Polygon Amoy Testnet</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="hover:text-white transition-colors duration-200">About</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Docs</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Support</a>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            © 2024 FlowMint. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
