import React, { createContext, useContext, useState, useCallback } from 'react';

interface CartContextType {
  cartCount: number;
  updateCartCount: (count: number) => void;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const updateCartCount = useCallback((count: number) => {
    setCartCount(count);
  }, []);

  const refreshCart = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export { CartContext };
