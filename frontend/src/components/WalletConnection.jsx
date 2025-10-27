import React from 'react';
import { useWalletAuth } from '../hooks/useWalletAuth';

const WalletConnection = ({ className = '' }) => {
  const {
    address,
    isConnected,
    user,
    isAuthenticated,
    isLoading,
    error,
    logout,
  } = useWalletAuth();

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm">Authenticating...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Authentication failed: {error}
      </div>
    );
  }

  if (isConnected && isAuthenticated) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
        <button
          onClick={logout}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <appkit-button />
    </div>
  );
};

export default WalletConnection;
