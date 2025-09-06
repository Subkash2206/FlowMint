import React from "react";

const CreatorCard = ({ creator }) => {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
      <h3 className="font-bold">{creator.name}</h3>
      <p className="text-gray-600">{creator.project}</p>
      <p className="text-gray-400 text-sm">{creator.description}</p>
      <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded">
        Invest / Mint
      </button>
    </div>
  );
};

export default CreatorCard;
