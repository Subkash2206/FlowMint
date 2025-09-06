import React, { useState } from "react";
import { ethers } from "ethers";

const Login = () => {
  const [wallet, setWallet] = useState("");
  const [role, setRole] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask first!");
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWallet(accounts[0]);
  };

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    // Call backend to register wallet + role
    fetch("http://localhost:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: wallet, role: selectedRole }),
    }).then(() => alert("Role saved!"));
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!wallet ? (
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg"
        >
          Connect Wallet
        </button>
      ) : !role ? (
        <div className="flex flex-col items-center">
          <h2 className="mb-4">Select your role</h2>
          <div className="flex gap-4">
            <button
              onClick={() => selectRole("creator")}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Creator
            </button>
            <button
              onClick={() => selectRole("investor")}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Investor
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2>Welcome, {role}</h2>
          <p>Wallet: {wallet}</p>
          {/* Redirect to dashboard */}
        </div>
      )}
    </div>
  );
};

export default Login;
