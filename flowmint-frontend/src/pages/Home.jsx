import React, { useState } from "react";
import CreatorCard from "../components/CreatorCard";

const dummyCreators = [
  { name: "Alice", project: "Cyber Wolf NFT", description: "AI art NFT" },
  { name: "Bob", project: "Neon Tiger", description: "AI NFT project" },
];

const Home = () => {
  const [search, setSearch] = useState("");

  const filtered = dummyCreators.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-800 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">FlowMint AI</h1>
        <input
          type="text"
          placeholder="Search creators..."
          className="px-2 rounded text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-gray-100 p-4">
          <h2 className="font-bold mb-4">Categories</h2>
          <ul>
            <li>Trending</li>
            <li>Music</li>
            <li>Art</li>
            <li>Tech</li>
          </ul>
        </aside>

        <main className="flex-1 p-4 grid grid-cols-3 gap-4 overflow-y-auto">
          {filtered.map((creator, i) => (
            <CreatorCard key={i} creator={creator} />
          ))}
        </main>
      </div>
    </div>
  );
};

export default Home;
