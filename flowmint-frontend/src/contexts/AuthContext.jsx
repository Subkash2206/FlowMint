'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data
    const storedToken = localStorage.getItem('flowmint_token');
    const storedUser = localStorage.getItem('flowmint_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (walletAddress, role, userData = {}) => {
    try {
      // For MVP, create a mock user if backend is not available
      const mockUser = {
        id: Date.now(),
        wallet_address: walletAddress || '0x1234567890123456789012345678901234567890',
        username: userData.username || `${role}_user_${Date.now()}`,
        email: userData.email || '',
        role: role,
        bio: userData.bio || '',
        profile_image_url: userData.profile_image_url || '',
        total_revenue: role === 'creator' ? 2500 : 0,
        total_invested: role === 'investor' ? 1500 : 0,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const mockToken = 'mock_jwt_token_' + Date.now();
      
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem('flowmint_token', mockToken);
      localStorage.setItem('flowmint_user', JSON.stringify(mockUser));
      
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (walletAddress, role, userData = {}) => {
    // For MVP, just call login with the same mock logic
    return await login(walletAddress, role, userData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('flowmint_token');
    localStorage.removeItem('flowmint_user');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
