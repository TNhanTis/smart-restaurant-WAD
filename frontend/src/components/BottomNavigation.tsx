import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import cartApi from '../api/cartApi';
import { useCart } from '../contexts/CartContext';
import './BottomNavigation.css';

interface BottomNavigationProps {
  activeTab?: 'menu' | 'cart' | 'orders' | 'profile';
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab = 'menu' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, updateCartCount } = useCart();

  useEffect(() => {
    fetchCartCount();
  }, [location.pathname]);

  const fetchCartCount = async () => {
    try {
      const cart = await cartApi.getCart();
      console.log('BottomNavigation - Cart data:', cart);
      console.log('BottomNavigation - item_count:', cart.item_count);
      console.log('BottomNavigation - items.length:', cart.items?.length);
      updateCartCount(cart.item_count || 0);
    } catch (err) {
      console.error('Failed to fetch cart count:', err);
      updateCartCount(0);
    }
  };

  return (
    <div className="bottom-navigation">
      <button
        className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}
        onClick={() => navigate('/customer/order')}
      >
        <span className="nav-icon">🍽️</span>
        <span className="nav-label">Menu</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'cart' ? 'active' : ''}`}
        onClick={() => navigate('/customer/cart')}
      >
        <span className="nav-icon">🛒</span>
        {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
        <span className="nav-label">Cart</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
        onClick={() => navigate('/customer/order-status')}
      >
        <span className="nav-icon">📋</span>
        <span className="nav-label">Orders</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => navigate('/customer/profile')}
      >
        <span className="nav-icon">👤</span>
        <span className="nav-label">Profile</span>
      </button>
    </div>
  );
};

export default BottomNavigation;
