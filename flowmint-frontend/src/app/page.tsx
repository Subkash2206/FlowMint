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

  // USDC allowance check
  const { data: allowanceData } = useReadContract({
    address: usdcAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address, revenueDistributorAddress],
    query: { enabled: !!usdcAddress && !!address },
  });

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
    } catch (error) {
      console.error('Mint error:', error);
      setTransactionStatus('error');
      if (error.message?.includes('User rejected')) {
        alert('Transaction was cancelled by user.');
      } else if (error.message?.includes('insufficient funds')) {
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
    } catch (error) {
      console.error('Approve error:', error);
      setTransactionStatus('error');
      if (error.message?.includes('User rejected')) {
        alert('Transaction was cancelled by user.');
      } else if (error.message?.includes('insufficient funds')) {
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
    } catch (error) {
      console.error('Deposit error:', error);
      setTransactionStatus('error');
      if (error.message?.includes('User rejected')) {
        alert('Transaction was cancelled by user.');
      } else if (error.message?.includes('insufficient funds')) {
        alert('Insufficient funds for gas. Please add MATIC to your wallet.');
      } else if (error.message?.includes('allowance')) {
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
    } catch (error) {
      console.error('Claim error:', error);
      setTransactionStatus('error');
      if (error.message?.includes('User rejected')) {
        alert('Transaction was cancelled by user.');
      } else if (error.message?.includes('insufficient funds')) {
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

        {/* CREATOR */}
        <section className="space-y-4 bg-gray-900/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl sm:text-2xl font-semibold border-b border-gray-600 pb-2 text-gray-200">
            For Creators (Token Conversion)
          </h2>
          <div className="text-sm text-gray-400 mb-4">
            Convert your FlowMint tokens to real revenue and distribute to investors
          </div>
          <input
            type="number"
            value={revenueAmount}
            onChange={(e) => setRevenueAmount(e.target.value)}
            placeholder="Enter revenue amount to convert (e.g., 25.5)"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleApproveUSDC}
              disabled={!isConnected || isPending || !revenueAmount}
              className="w-full px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Convert Tokens
            </button>
            <button
              onClick={handleDepositRevenue}
              disabled={!isConnected || isPending || !revenueAmount}
              className="w-full px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Distribute Revenue
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
                    <p className="text-xs text-gray-400 mt-2 font-mono break-all">
                      Hash: {transactionHash}
                    </p>
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
                    <p className="text-xs text-gray-400 mt-2 font-mono break-all">
                      Hash: {transactionHash}
                    </p>
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
              
              <button
                onClick={() => setShowTransactionModal(false)}
                className="mt-6 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
              >
                {transactionStatus === 'success' ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
