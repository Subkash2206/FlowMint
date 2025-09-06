'use client';

import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = 'http://localhost:8000/api';

export const useApi = () => {
  const { token, user } = useAuth();

  // Store created projects in localStorage for persistence
  const getStoredProjects = () => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('flowmint_projects');
    return stored ? JSON.parse(stored) : [];
  };

  const storeProjects = (projects) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('flowmint_projects', JSON.stringify(projects));
    }
  };

  const request = async (endpoint, options = {}) => {
    // For MVP, return mock data instead of making real API calls
    console.log('Mock API call:', endpoint, options);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Handle POST requests for project creation
    if (options.method === 'POST' && endpoint === '/projects') {
      const projectData = options.body ? JSON.parse(options.body) : {};
      const newProject = {
        id: Date.now(),
        ...projectData,
        creator_id: user?.id || 1,
        current_revenue: 0,
        investor_count: 0,
        nft_token_id: Math.floor(Math.random() * 1000) + 1,
        nft_contract_address: "0x1234567890123456789012345678901234567890",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Store the new project
      const existingProjects = getStoredProjects();
      const updatedProjects = [...existingProjects, newProject];
      storeProjects(updatedProjects);
      
      return newProject;
    }
    
    // Mock data based on endpoint
    if (endpoint.includes('/dashboard')) {
      const isCreator = endpoint.includes('/creator/');
      const storedProjects = getStoredProjects();
      const userProjects = storedProjects.filter(p => p.creator_id === user?.id);
      
      return {
        user: user || {
          id: 1,
          username: isCreator ? 'alice_creator' : 'charlie_investor',
          wallet_address: '0x1234567890123456789012345678901234567890',
          role: isCreator ? 'creator' : 'investor',
          bio: isCreator ? 'AI Artist creating unique digital masterpieces' : 'Crypto investor and NFT enthusiast',
          profile_image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          total_revenue: isCreator ? 2500 : 0,
          total_invested: isCreator ? 0 : 1500,
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        projects: isCreator ? userProjects.length > 0 ? userProjects : [
          {
            id: 1,
            name: "Cyber Wolf NFT Collection",
            description: "A unique collection of AI-generated wolf NFTs with cyberpunk aesthetics",
            category: "art",
            target_revenue: 10000,
            current_revenue: 2500,
            nft_token_id: 1,
            nft_contract_address: "0x1234567890123456789012345678901234567890",
            image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            creator_id: 1
          }
        ] : [],
        investments: isCreator ? [] : (() => {
          const userInvestments = JSON.parse(localStorage.getItem('userInvestments') || '[]');
          return userInvestments.map(inv => ({
            id: inv.id,
            amount: inv.amount,
            nft_token_id: inv.nft_token_id,
            transaction_hash: `0x${Math.random().toString(16).substr(2, 8)}`,
            investor_id: user?.id || 1,
            project_id: inv.project_id,
            project_name: inv.project_name,
            project_creator: inv.project_creator,
            created_at: inv.created_at,
            status: inv.status
          }));
        })(),
        total_revenue: isCreator ? 2500 : 0,
        total_investors: isCreator ? (() => {
          const projects = isCreator ? userProjects : [];
          return projects.reduce((sum, p) => sum + (p.investor_count || 0), 0);
        })() : 0,
        total_invested: isCreator ? 0 : (() => {
          const userInvestments = JSON.parse(localStorage.getItem('userInvestments') || '[]');
          return userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
        })(),
        total_projects: isCreator ? 1 : 0,
        recent_investments: isCreator ? [
          {
            id: 1,
            amount: 500,
            nft_token_id: 1,
            transaction_hash: "0xabc123",
            investor_id: 1,
            project_id: 1,
            created_at: new Date().toISOString()
          }
        ] : [],
        recent_revenue: []
      };
    } else if (endpoint === '/projects') {
      const storedProjects = getStoredProjects();
      const defaultProjects = [
        {
          id: 1,
          name: "Cyber Wolf NFT Collection",
          description: "A unique collection of AI-generated wolf NFTs with cyberpunk aesthetics",
          category: "art",
          target_revenue: 10000,
          current_revenue: 2500,
          nft_token_id: 1,
          nft_contract_address: "0x1234567890123456789012345678901234567890",
          image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          creator_id: 1
        },
        {
          id: 2,
          name: "Neon Tiger Music Project",
          description: "Electronic music album with NFT ownership rights",
          category: "music",
          target_revenue: 5000,
          current_revenue: 1200,
          nft_token_id: 2,
          nft_contract_address: "0x1234567890123456789012345678901234567890",
          image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          creator_id: 2
        },
        {
          id: 3,
          name: "Tech Innovation Hub",
          description: "Revolutionary tech project with revenue sharing",
          category: "tech",
          target_revenue: 25000,
          current_revenue: 5000,
          nft_token_id: 3,
          nft_contract_address: "0x1234567890123456789012345678901234567890",
          image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          creator_id: 1
        }
      ];
      
      return [...storedProjects, ...defaultProjects];
    }
    
    return {};
  };

  return {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    post: (endpoint, data) => request(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    put: (endpoint, data) => request(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
  };
};
