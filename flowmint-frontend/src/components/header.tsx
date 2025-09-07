"use client";
import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

export default function Header() {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-[#0f0f28]/70 backdrop-blur-md border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo + Brand */}
        <a href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            FlowMint
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="/#home" className="text-gray-300 hover:text-pink-400">Home</a>
          <a href="/#how" className="text-gray-300 hover:text-pink-400">How It Works</a>
          <a href="/#features" className="text-gray-300 hover:text-pink-400">Features</a>
          <a href="/flowchart" className="text-gray-300 hover:text-pink-400">Flowchart</a>
          <a href="/login?role=creator" className="text-gray-300 hover:text-pink-400">Creator</a>
          <a href="/login?role=investor" className="text-gray-300 hover:text-pink-400">Investor</a>
        </nav>

        {/* Wallet / Connect */}
        {!isConnected ? (
          <button
            onClick={() => connect({ connector: injected() })}
            className="hidden md:inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Connect Wallet
          </button>
        ) : (
          <p className="hidden md:block text-sm text-green-400 font-mono">
            {(address ?? "").slice(0, 6)}...{(address ?? "").slice(-4)}
          </p>
        )}

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-200 text-2xl leading-none"
          aria-label="Toggle menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-[#1a1a40]/95 px-6 py-4 space-y-4 border-t border-white/10">
          <a href="/#home" className="block text-gray-300 hover:text-pink-400">Home</a>
          <a href="/#how" className="block text-gray-300 hover:text-pink-400">How It Works</a>
          <a href="/#features" className="block text-gray-300 hover:text-pink-400">Features</a>
          <a href="/flowchart" className="block text-gray-300 hover:text-pink-400">Flowchart</a>
          <a href="/login?role=creator" className="block text-gray-300 hover:text-pink-400">Creator</a>
          <a href="/login?role=investor" className="block text-gray-300 hover:text-pink-400">Investor</a>
          {!isConnected ? (
            <button
              onClick={() => connect({ connector: injected() })}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Connect Wallet
            </button>
          ) : (
            <p className="text-sm text-green-400 font-mono">
              {(address ?? "").slice(0, 6)}...{(address ?? "").slice(-4)}
            </p>
          )}
        </div>
      )}
    </header>
  );
}