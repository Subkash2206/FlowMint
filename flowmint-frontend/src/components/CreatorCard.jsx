import React from "react";

const CreatorCard = ({ creator }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <h3 className="font-bold text-white text-lg mb-2">{creator.name}</h3>
      <p className="text-gray-300 mb-2">{creator.project}</p>
      <p className="text-gray-400 text-sm mb-4">{creator.description}</p>
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
        Invest / Mint
      </button>
    </div>
  );
};

export default CreatorCard;
