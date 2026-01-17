import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { getPublicMenu, getMenuCategories } from '../../api/publicApi';
import { fuzzySearchMenuItems } from '../../utils/fuzzySearch';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useUrlSync, useUrlParams } from '../../hooks/useUrlSync';
import { useDebounce } from '../../hooks/useDebounce';
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
  isChefRecommended?: boolean;
}

export default function CustomerMenu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const restaurantId = searchParams.get('restaurant');

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]); // Store all loaded items
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurantName, setRestaurantName] = useState<string>('Restaurant Menu');
  const [sortBy, setSortBy] = useState<string>(''); // '', 'popularity', 'chef'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Debounce search term with 300ms delay
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Get initial params from URL
  const urlParams = useUrlParams();

  // Sync state with URL
  useUrlSync({
    searchTerm,
    selectedCategory,
    sortBy,
    page: page > 1 ? page : undefined,
  });

  // Helper function to load menu
  const loadMenu = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      const [categoriesData, menuData] = await Promise.all([
        pageNum === 1 ? getMenuCategories(restaurantId) : Promise.resolve(categories),
        getPublicMenu(undefined, undefined, restaurantId, sortBy, pageNum, 20),
      ]);

      if (pageNum === 1) {
        setCategories(categoriesData || []);
      }

      const items = menuData?.items || [];

      if (append) {
        setAllMenuItems(prev => [...prev, ...items]);
      } else {
        setAllMenuItems(items);
        setPage(1);
      }

      setTotalPages(menuData?.pagination?.totalPages || 1);
      if (append) {
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, sortBy, categories]);

  // Load more items for infinite scroll
  const loadMoreItems = useCallback(async () => {
    if (page >= totalPages || loading) return;
    await loadMenu(page + 1, true);
  }, [page, totalPages, loading, loadMenu]);

  // Infinite scroll hook
  const { isLoadingMore } = useInfiniteScroll(loadMoreItems, {
    enabled: page < totalPages && !searchTerm && !selectedCategory,
    threshold: 500,
  });

  useEffect(() => {
    if (location.state && (location.state as any).restaurantName) {
      setRestaurantName((location.state as any).restaurantName);
    }

    if (!restaurantId) {
      navigate('/customer/restaurants');
      return;
    }

    // Initialize from URL params
    const initialPage = urlParams.page || 1;

    if (urlParams.searchTerm) setSearchTerm(urlParams.searchTerm);
    if (urlParams.selectedCategory) setSelectedCategory(urlParams.selectedCategory);
    if (urlParams.sortBy) setSortBy(urlParams.sortBy);

    // Load all pages from 1 to initialPage
    const loadInitialPages = async () => {
      if (initialPage === 1) {
        // Just load page 1
        await loadMenu(1, false);
      } else {
        // Load page 1 first
        await loadMenu(1, false);

        // Then load pages 2 to initialPage sequentially
        for (let p = 2; p <= initialPage; p++) {
          await loadMenu(p, true);  // Append mode
        }
      }
    };

    loadInitialPages();
  }, [restaurantId, navigate, location.state]);

  // Fuzzy search and filter logic
  const filteredItems = useMemo(() => {
    let items = allMenuItems;

    // Filter by category
    if (selectedCategory) {
      items = items.filter(item => item.category?.id === selectedCategory);
    }

    // Apply fuzzy search
    if (searchTerm.trim()) {
      items = fuzzySearchMenuItems(items, searchTerm);
    }

    // Apply sorting
    if (sortBy === 'popularity') {
      // Sort by popularity (you can add a popularity field later)
      items = [...items]; // Keep order for now
    } else if (sortBy === 'chef') {
      items = [...items].sort((a, b) => {
        if (a.isChefRecommended && !b.isChefRecommended) return -1;
        if (!a.isChefRecommended && b.isChefRecommended) return 1;
        return 0;
      });
    }

    return items;
  }, [allMenuItems, selectedCategory, searchTerm, sortBy]);

  // Update displayed items when filters change
  useEffect(() => {
    setMenuItems(filteredItems);
  }, [filteredItems]);

  // Effect to handle debounced search
  useEffect(() => {
    const performSearch = async () => {
      if (!restaurantId) return;

      // If searching, load ALL items for fuzzy search to work properly
      if (debouncedSearchTerm.trim()) {
        setLoading(true);
        try {
          const menuData = await getPublicMenu(
            undefined,
            undefined,
            restaurantId,
            sortBy,
            1,
            1000  // Load all items (adjust if you have more than 1000)
          );
          setAllMenuItems(menuData?.items || []);
          setTotalPages(menuData?.pagination?.totalPages || 1);
        } catch (error) {
          console.error('Failed to load all items for search:', error);
        } finally {
          setLoading(false);
        }
      } else if (searchTerm === '' && debouncedSearchTerm === '') {
        // Only reload when both searchTerm and debouncedSearchTerm are empty
        await loadMenu(1, false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, restaurantId, sortBy]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);  // Update immediately for UI
    setPage(1);
    // API call will be triggered by useEffect after debounce delay
  };

  const handleSortChange = async (newSortBy: string) => {
    setSortBy(newSortBy);
    setPage(1);
    // Reload with new sort
    if (restaurantId) {
      await loadMenu(1, false);
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

      {/* Sort Dropdown */}
      <div className="sort-section">
        <label htmlFor="sort-select" className="sort-label">Sort by:</label>
        <select
          id="sort-select"
          className="sort-select"
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="">Default</option>
          <option value="popularity">Most Popular</option>
          <option value="chef">Chef's Recommendations</option>
        </select>
      </div>

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
                {/* Show badge for chef recommended items */}
                {item.isChefRecommended && (
                  <div className="chef-recommend-badge">
                    <span className="chef-icon">👨‍🍳</span>
                    <span className="chef-text">Chef's Pick</span>
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

        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px 20px',
            color: '#7f8c8d'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              border: '3px solid #ecf0f1',
              borderTopColor: '#e74c3c',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 10px'
            }}></div>
            <p style={{ margin: 0, fontSize: '14px' }}>Loading more items...</p>
          </div>
        )}

        {/* End of list indicator */}
        {!loading && !isLoadingMore && page >= totalPages && menuItems.length > 0 && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px 20px',
            color: '#95a5a6',
            fontSize: '14px'
          }}>
            ✓ You've reached the end
          </div>
        )}
      </div>
    </div>
  );
}
