import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ordersApi, { Order } from '../../api/ordersApi';
import './OrderStatus.css';

function OrderStatus() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionTotal, setSessionTotal] = useState(0);

  useEffect(() => {
    fetchOrders();
    // Poll every 10 seconds for updates
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [id]); // Re-fetch when id changes

  const fetchOrders = async () => {
    try {
      let ordersData: Order[] = [];

      // Always fetch all orders for current table to show session total
      const tableInfo = localStorage.getItem('table_info');
      if (tableInfo) {
        const { id: tableId } = JSON.parse(tableInfo);
        const response = await ordersApi.getByTable(tableId);
        // Backend returns { data: [], total: N }, extract the data array
        ordersData = (response as any).data || response;
      }

      setOrders(ordersData);

      // Calculate total (backend returns 'total', not 'total_price')
      const total = ordersData.reduce((sum, order) => sum + Number((order as any).total || 0), 0);
      setSessionTotal(total);

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Received',
      accepted: 'Accepted',
      preparing: 'Preparing',
      ready: 'Ready',
      served: 'Served',
      completed: 'Completed',
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    if (status === 'preparing') return 'preparing';
    if (status === 'ready') return 'ready';
    if (status === 'completed' || status === 'served') return 'completed';
    return '';
  };

  const getProgressSteps = (status: string) => {
    const steps = ['pending', 'preparing', 'ready'];
    const currentIndex = steps.indexOf(status);
    return steps.map((step, index) => ({
      label: getStatusText(step),
      completed: index < currentIndex,
      active: index === currentIndex,
    }));
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const created = new Date(timestamp).getTime();
    const diff = Math.floor((now - created) / 1000 / 60); // minutes

    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} mins ago`;
    const hours = Math.floor(diff / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="mobile-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="header">
        <span className="header-title">Your Orders</span>
        <span className="header-table">
          {(() => {
            const tableInfo = localStorage.getItem('table_info');
            if (tableInfo) {
              const { tableNumber } = JSON.parse(tableInfo);
              return `Table ${tableNumber}`;
            }
            return 'Table';
          })()}
        </span>
      </div>

      {/* Content */}
      <div className="content" style={{ paddingBottom: '100px' }}>
        {/* Current Session Summary */}
        <div className="session-summary">
          <div className="session-info">
            <div className="session-label">Session Total</div>
            <div className="session-total">{Math.round(Number(sessionTotal)).toLocaleString('vi-VN')}₫</div>
          </div>
          <button className="request-bill-btn" onClick={() => navigate('/customer/payment')}>
            Request Bill
          </button>
          <div className="session-meta">
            <span>📄 {orders.length} Orders</span>
            <span>🍽️ {orders.reduce((sum, o) => sum + (o.items?.length || 0), 0)} Items</span>
          </div>
        </div>

        {/* Orders */}
        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="empty-icon">📋</div>
            <h2>No orders yet</h2>
            <p>Start by browsing our menu and placing your first order!</p>
            <button className="browse-menu-btn" onClick={() => navigate('/customer/order')}>
              🍽️ Browse Menu
            </button>
          </div>
        ) : (
          orders.map((order) => {
            const steps = getProgressSteps(order.status);
            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <span className="order-number">Order #{order.order_number}</span>
                    <span className="order-time">{getTimeAgo(order.created_at)}</span>
                  </div>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="order-progress">
                  {steps.map((step, index) => (
                    <React.Fragment key={index}>
                      <div className={`progress-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}>
                        <div className="progress-dot">
                          {step.completed ? '✓' : ''}
                        </div>
                        <span>{step.label}</span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`progress-line ${step.completed ? 'completed' : ''}`}></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Ready notification */}
                {order.status === 'ready' && (
                  <div className="ready-notification">
                    <span style={{ fontSize: '20px' }}>🎉</span>
                    <span>Your order is ready! Please pick up at the counter.</span>
                  </div>
                )}

                {/* Order Items */}
                <div className="order-items">
                  {(order as any).order_items?.map((item: any) => (
                    <div key={item.id} className="order-item">
                      <span className="item-qty">{item.quantity}x</span>
                      <span className="item-name">
                        {item.menu_item?.name || 'Item'}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <span className="item-mods">
                            {' '}({item.modifiers.map((m: any) => m.modifier_option?.name).join(', ')})
                          </span>
                        )}
                      </span>
                      <span className="item-status cooking">🔥 Cooking</span>
                    </div>
                  ))}
                </div>

                <div className="order-total">
                  <span>Order Total</span>
                  <span>{Math.round((order as any).total || 0).toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            );
          })
        )}

        {/* Add more items prompt */}
        <div className="add-more-section">
          <p>Want to order more?</p>
          <button className="add-more-btn" onClick={() => navigate('/customer/order')}>
            🍽️ Browse Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderStatus;
