import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRelatedItems } from '../api/publicApi';
import './RelatedItems.css';

interface RelatedItem {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  image: string | null;
  isAvailable: boolean;
  isChefRecommended: boolean;
}

interface RelatedItemsProps {
  itemId: string;
  context?: 'view' | 'order'; // 'view' for menu browsing, 'order' for ordering with cart
}

const RelatedItems: React.FC<RelatedItemsProps> = ({ itemId, context = 'order' }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedItems();
  }, [itemId]);

  const fetchRelatedItems = async () => {
    try {
      setLoading(true);
      const data = await getRelatedItems(itemId);
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch related items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (id: string) => {
    // Navigate based on context
    const route = context === 'view'
      ? `/customer/menu/item/${id}`
      : `/customer/order/item/${id}`;
    navigate(route);
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="related-items-section">
        <h3 className="related-items-title">You Might Also Like</h3>
        <div className="related-items-loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Don't show section if no related items
  }

  return (
    <div className={`related-items-section ${context === 'order' ? 'with-bottom-nav' : ''}`}>
      <h3 className="related-items-title">
        <span className="icon">🍽️</span> You Might Also Like
      </h3>

      <div className="related-items-container">
        <div className="related-items-scroll">
          {items.map((item) => (
            <div
              key={item.id}
              className="related-item-card"
              onClick={() => handleItemClick(item.id)}
            >
              <div className="related-item-image">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="related-item-no-image">
                    <span>🍽️</span>
                  </div>
                )}
                {item.isChefRecommended && (
                  <div className="chef-badge">
                    <span>👨‍🍳</span>
                  </div>
                )}
                {!item.isAvailable && (
                  <div className="unavailable-overlay">
                    <span>Unavailable</span>
                  </div>
                )}
              </div>

              <div className="related-item-info">
                <h4 className="related-item-name">{item.name}</h4>
                <p className="related-item-price">
                  {Math.round(typeof item.price === 'number' ? item.price : parseFloat(item.price.toString())).toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedItems;
