import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { getPublicMenu, getMenuCategories } from '../../api/publicApi';
import './CustomerMenu.css';

interface Category {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  itemCount: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  isAvailable: boolean;
}

export default function CustomerMenu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const restaurantId = searchParams.get('restaurant');
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurantName, setRestaurantName] = useState<string>('Restaurant Menu');

  useEffect(() => {
    if (location.state && (location.state as any).restaurantName) {
      setRestaurantName((location.state as any).restaurantName);
    }

    if (!restaurantId) {
      navigate('/customer/restaurants');
      return;
    }

    const loadMenu = async () => {
      try {
        const [categoriesData, menuData] = await Promise.all([
          getMenuCategories(restaurantId),
          getPublicMenu(undefined, undefined, restaurantId),
        ]);
        setCategories(categoriesData || []);
        setMenuItems(menuData?.items || []);
      } catch (error) {
        console.error('Failed to load menu:', error);
      }
    };

    loadMenu();
  }, [restaurantId, navigate, location.state]);

  const handleCategoryChange = async (categoryId: string) => {
    if (!restaurantId) return;
    setSelectedCategory(categoryId);
    try {
      const menuData = await getPublicMenu(categoryId || undefined, searchTerm || undefined, restaurantId);
      setMenuItems(menuData?.items || []);
    } catch (error) {
      console.error('Filter failed:', error);
    }
  };

  const handleSearch = async (term: string) => {
    if (!restaurantId) return;
    setSearchTerm(term);
    try {
      const menuData = await getPublicMenu(selectedCategory || undefined, term || undefined, restaurantId);
      setMenuItems(menuData?.items || []);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <div className="customer-menu">
      {/* Header */}
      <div className="menu-header">
        <div className="header-left">
          <button 
            className="header-back" 
            onClick={() => navigate('/customer/restaurants')}
          >
            ←
          </button>
        </div>
        <div className="header-center">
          <span className="restaurant-name-header">{restaurantName}</span>
        </div>
        <div className="header-right"></div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <div className="categories-filter">
          <button
            className={`category-chip ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('')}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-chip ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Menu Items Grid */}
      <div className="menu-items-grid">
        {menuItems.length === 0 ? (
          <div className="no-items">
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🍽️</div>
            <p>No menu items available</p>
          </div>
        ) : (
          menuItems.map((item) => (
            <div 
              key={item.id} 
              className="menu-item-card"
              onClick={() => navigate(`/customer/menu/item/${item.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="item-image-wrapper">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="item-image" />
                ) : (
                  <div className="item-image" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '48px',
                    background: '#f5f5f5'
                  }}>
                    🍽️
                  </div>
                )}
              </div>
              <div className="item-details">
                <h3 className="item-name">{item.name}</h3>
                {item.description && (
                  <p className="item-description">{item.description}</p>
                )}
                <div className="item-footer">
                  <span className="item-price">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.price))}
                  </span>
                  <span className={`item-status ${item.isAvailable ? 'available' : 'unavailable'}`}>
                    {item.isAvailable ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
