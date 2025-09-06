import React from 'react';
import ProjectCard from './ProjectCard';

const FeaturedProjects = () => {
  // Mock featured projects data
  const featuredProjects = [
    {
      id: 1,
      name: "Digital Art Collection",
      description: "A revolutionary NFT art collection featuring AI-generated masterpieces that evolve over time.",
      category: "Art",
      target_revenue: 50000,
      current_revenue: 32450,
      creator_name: "Alex Chen",
      image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop",
      nft_token_id: 101,
      is_active: true,
      investor_count: 23
    },
    {
      id: 2,
      name: "Music Streaming Platform",
      description: "Decentralized music streaming platform that rewards artists directly through blockchain technology.",
      category: "Music",
      target_revenue: 100000,
      current_revenue: 67890,
      creator_name: "Sarah Johnson",
      image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop",
      nft_token_id: 102,
      is_active: true,
      investor_count: 45
    },
    {
      id: 3,
      name: "Gaming Metaverse",
      description: "Immersive virtual world where players can own, trade, and monetize in-game assets as NFTs.",
      category: "Gaming",
      target_revenue: 250000,
      current_revenue: 156780,
      creator_name: "Mike Rodriguez",
      image_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=200&fit=crop",
      nft_token_id: 103,
      is_active: true,
      investor_count: 67
    },
    {
      id: 4,
      name: "Educational Content Hub",
      description: "Blockchain-based learning platform that tokenizes educational content and rewards both creators and learners.",
      category: "Education",
      target_revenue: 75000,
      current_revenue: 43210,
      creator_name: "Dr. Emily Watson",
      image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop",
      nft_token_id: 104,
      is_active: true,
      investor_count: 34
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
          Featured Projects
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Discover the most successful projects on FlowMint. These creators are already generating revenue and sharing it with their investors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProjects.map((project) => (
          <div key={project.id} className="transform hover:scale-105 transition-transform duration-300">
            <ProjectCard 
              project={project} 
              isOwner={false}
              onDelete={() => {}} // No delete functionality for featured projects
            />
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <a
          href="/home"
          className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
        >
          View All Projects
        </a>
      </div>
    </section>
  );
};

export default FeaturedProjects;
