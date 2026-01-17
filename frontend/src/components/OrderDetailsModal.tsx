import { Order } from "../api/ordersApi";
import OrderStatusBadge from "./OrderStatusBadge";
import "../App.css";

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

export default function OrderDetailsModal({
  order,
  onClose,
}: OrderDetailsModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order Details</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="order-detail-section">
            <h3>Order Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Order ID:</span>
                <span className="detail-value">
                  #{order.order_number || order.id}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Table:</span>
                <span className="detail-value">Table {order.table_id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  <OrderStatusBadge status={order.status} />
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created:</span>
                <span className="detail-value">
                  {new Date(order.created_at).toLocaleString()}
                </span>
              </div>
              {order.customer_id && (
                <div className="detail-item">
                  <span className="detail-label">Customer ID:</span>
                  <span className="detail-value">{order.customer_id}</span>
                </div>
              )}
            </div>
          </div>

          <div className="order-detail-section">
            <h3>Order Items</h3>
            <div className="order-items-list">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any, index: number) => (
                  <div key={index} className="order-item-card">
                    <div className="order-item-info">
                      <div className="order-item-name">
                        <span className="item-quantity">{item.quantity}x</span>
                        {item.name || `Item ${item.menu_item_id}`}
                      </div>
                      {item.notes && (
                        <div className="order-item-notes">
                          Note: {item.notes}
                        </div>
                      )}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="order-item-modifiers">
                          {item.modifiers.map((mod: any, idx: number) => (
                            <span key={idx} className="modifier-tag">
                              + {mod.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="order-item-price">
                      ${item.price?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                ))
              ) : (
                <p>No items in this order</p>
              )}
            </div>
          </div>

          <div className="order-detail-section">
            <h3>Order Summary</h3>
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${order.total_price?.toFixed(2) || "0.00"}</span>
              </div>
              {order.tax && (
                <div className="summary-row">
                  <span>Tax:</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
              )}
              {order.discount && (
                <div className="summary-row">
                  <span>Discount:</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total:</span>
                <span>${order.total_price?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </div>

          {order.special_instructions && (
            <div className="order-detail-section">
              <h3>Special Instructions</h3>
              <p className="special-instructions">
                {order.special_instructions}
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
