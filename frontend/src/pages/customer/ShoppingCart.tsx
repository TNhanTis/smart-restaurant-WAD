import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import cartApi, { Cart as CartData, CartItem } from "../../api/cartApi";
import { ordersApi } from "../../api/ordersApi";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useConfirm, useAlert } from "../../components/ConfirmDialog";
import "./ShoppingCart.css";

function ShoppingCart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateCartCount } = useCart();
  const { user } = useAuth();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const { showAlert, AlertDialogComponent } = useAlert();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<{
    tableNumber: string;
    tableId: string;
    restaurantId: string;
  } | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    // Get table info from localStorage
    const storedTableInfo = localStorage.getItem("table_info");
    const storedRestaurantInfo = localStorage.getItem("restaurant_info");

    console.log("Loading table info from localStorage:", {
      storedTableInfo,
      storedRestaurantInfo,
    });

    if (storedTableInfo && storedRestaurantInfo) {
      const tableData = JSON.parse(storedTableInfo);
      const restaurantData = JSON.parse(storedRestaurantInfo);
      const info = {
        tableNumber: tableData.tableNumber,
        tableId: tableData.id,
        restaurantId: restaurantData.id,
      };
      console.log("Parsed table info:", info);
      setTableInfo(info);
    } else {
      console.error("Missing table or restaurant info in localStorage!");
    }
  }, []);

  useEffect(() => {
    console.log("Cart page loaded/navigated, fetching cart...");
    fetchCart();
  }, [location.key]); // Re-fetch whenever navigation happens

  const fetchCart = async () => {
    try {
      // Don't show loading if we already have data (for refreshes)
      if (!cart) {
        setLoading(true);
      }
      setError(null);
      console.log("Fetching cart...");
      const data = await cartApi.getCart();
      console.log("Cart data received:", data);
      setCart(data);
      updateCartCount(data.item_count || 0);
    } catch (err: any) {
      console.error("Failed to fetch cart:", err);
      console.error("Error response:", err.response?.data);
      setError(
        err.response?.data?.message || err.message || "Failed to load cart",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    console.log("handleUpdateQuantity called:", { itemId, newQuantity });

    if (newQuantity < 1) {
      console.log("Quantity < 1, will remove item via handleRemoveItem...");
      // Don't call handleRemoveItem here to avoid recursion
      // Instead remove directly
      const confirmed = await confirm(
        "Xác nhận",
        "Bạn có muốn xóa món này khỏi giỏ hàng?",
      );
      if (!confirmed) return;

      try {
        console.log("Removing item via updateQuantity:", itemId);
        await cartApi.removeCartItem(itemId);
        console.log("Item removed, refreshing cart...");
        await fetchCart();
      } catch (err: any) {
        console.error("Failed to remove item:", err);
        showAlert(err.response?.data?.message || "Không thể xóa món", {
          type: "error",
        });
      }
      return;
    }

    try {
      console.log("Updating quantity via API...");
      await cartApi.updateCartItem(itemId, { quantity: newQuantity });
      console.log("Quantity updated, refreshing cart...");
      await fetchCart();
    } catch (err: any) {
      console.error("Failed to update quantity:", err);
      console.error("Error response:", err.response?.data);
      showAlert(err.response?.data?.message || "Không thể cập nhật số lượng", {
        type: "error",
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const confirmed = await confirm(
      "Xác nhận",
      "Bạn có muốn xóa món này khỏi giỏ hàng?",
    );
    if (!confirmed) return;

    try {
      console.log("Removing item:", itemId);
      await cartApi.removeCartItem(itemId);
      console.log("Item removed, refreshing cart...");
      await fetchCart();
    } catch (err: any) {
      console.error("Failed to remove item:", err);
      console.error("Error response:", err.response?.data);
      showAlert(err.response?.data?.message || "Không thể xóa món", {
        type: "error",
      });
    }
  };

  const _handleClearCart = async () => {
    const confirmed = await confirm(
      "Xác nhận",
      "Bạn có muốn xóa tất cả món trong giỏ hàng?",
    );
    if (!confirmed) return;

    try {
      console.log("Clearing entire cart...");
      await cartApi.clearCart();
      console.log("Cart cleared, refreshing...");
      await fetchCart();
    } catch (err: any) {
      console.error("Failed to clear cart:", err);
      showAlert(err.response?.data?.message || "Không thể xóa giỏ hàng", {
        type: "error",
      });
    }
  };

  const [guestName, setGuestName] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      showAlert("Giỏ hàng của bạn đang trống!", { type: "warning" });
      return;
    }

    if (!tableInfo?.tableId) {
      showAlert("Không tìm thấy thông tin bàn. Vui lòng quét lại mã QR.", {
        type: "error",
      });
      return;
    }

    const confirmed = await confirm(
      "Xác nhận đặt món",
      "Bạn có chắc chắn muốn đặt món ngay bây giờ?",
    );
    if (!confirmed) {
      return;
    }

    try {
      setPlacingOrder(true);

      // Prepare order items from cart
      const orderItems = cart.items.map((item) => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        special_requests: item.special_requests || undefined,
        modifiers: item.modifiers?.map((mod) => ({
          modifier_option_id: mod.modifier_option_id, // Use the correct modifier_option_id, not cart_item_modifier id
        })),
      }));

      const orderData = {
        restaurant_id: tableInfo.restaurantId,
        table_id: tableInfo.tableId,
        customer_id: user?.id, // Add customer_id if user is logged in
        guest_name: guestName || undefined,
        items: orderItems,
        special_requests: specialInstructions || undefined,
      };

      console.log("Sending order data:", JSON.stringify(orderData, null, 2));
      console.log("User info:", {
        userId: user?.id,
        email: user?.email,
        isLoggedIn: !!user,
      });

      // Create order
      const order = await ordersApi.create(orderData);

      console.log("Order created successfully:", order);

      // Clear cart after successful order
      await cartApi.clearCart();
      updateCartCount(0);

      // Navigate to order status page
      navigate(`/customer/order-status/${order.id}`, {
        state: { orderNumber: order.order_number },
      });
    } catch (err: any) {
      console.error("Failed to place order:", err);
      console.error("Error response data:", err.response?.data);
      console.error("Error response status:", err.response?.status);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Đặt món thất bại. Vui lòng thử lại.";
      showAlert(errorMessage, { type: "error" });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="mobile-container">
        <div className="loading">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-container">
        <div className="header">
          <span className="header-title">Shopping Cart</span>
        </div>
        <div className="error" style={{ padding: "20px", textAlign: "center" }}>
          <p>{error}</p>
          <button onClick={fetchCart} style={{ marginTop: "10px" }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="header">
        <span className="header-title">Your Cart</span>
        <span className="header-table">
          {tableInfo ? `Table ${tableInfo.tableNumber}` : ""}
        </span>
      </div>

      {/* Cart Content */}
      <div
        className="content"
        style={{ paddingBottom: isEmpty ? "100px" : "200px" }}
      >
        {isEmpty ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some delicious items from our menu!</p>
            <button
              className="browse-menu-btn"
              onClick={() => navigate("/customer/order")}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            {cart!.items.map((item: CartItem) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">🍽️</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="cart-item-modifiers">
                      {item.modifiers.map((mod) => mod.name).join(", ")}
                    </div>
                  )}
                  {item.special_requests && (
                    <div className="cart-item-note">
                      {item.special_requests}
                    </div>
                  )}
                  <div className="cart-item-price">
                    {Number(item.price)
                      .toFixed(0)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                    ₫
                  </div>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-control small">
                    <button
                      className="qty-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Decrease quantity for:", item.id);
                        handleUpdateQuantity(item.id, item.quantity - 1);
                      }}
                    >
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Increase quantity for:", item.id);
                        handleUpdateQuantity(item.id, item.quantity + 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log(
                        "Remove button clicked for item:",
                        item.id,
                        item.name,
                      );
                      handleRemoveItem(item.id);
                    }}
                    style={{
                      cursor: "pointer",
                      zIndex: 10,
                      pointerEvents: "auto",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            {/* Order Summary */}
            <div className="order-summary">
              <div className="summary-title">Order Summary</div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>
                  {Number(cart!.subtotal)
                    .toFixed(0)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                  ₫
                </span>
              </div>
              <div className="summary-row">
                <span>Tax (10%)</span>
                <span>
                  {Number(cart!.tax)
                    .toFixed(0)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                  ₫
                </span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>
                  {Number(cart!.total)
                    .toFixed(0)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                  ₫
                </span>
              </div>
            </div>

            {/* Order Details Inputs */}
            <div
              className="order-details-inputs"
              style={{
                padding: "0 16px",
                marginBottom: "20px",
                marginTop: "20px",
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 600,
                    color: "#374151",
                    fontSize: "14px",
                  }}
                >
                  Guest Name{" "}
                  <span style={{ fontWeight: 400, color: "#9ca3af" }}>
                    (Optional)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Anh Bao"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    fontSize: "15px",
                    backgroundColor: "#f9fafb",
                    color: "#1f2937",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 600,
                    color: "#374151",
                    fontSize: "14px",
                  }}
                >
                  Special Instructions
                </label>
                <textarea
                  placeholder="Ex: No onions, less spicy, separate sauce..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    fontSize: "15px",
                    minHeight: "100px",
                    fontFamily: "inherit",
                    backgroundColor: "#f9fafb",
                    color: "#1f2937",
                    resize: "none",
                  }}
                />
              </div>
            </div>

            {/* Info Note */}
            <div className="info-note">
              <span style={{ fontSize: "20px" }}>ℹ️</span>
              <div>
                <strong>Pay After Your Meal</strong>
                <br />
                You can place multiple orders during your visit. Payment will be
                processed when you request the bill.
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Buttons */}
      {!isEmpty && (
        <div className="cart-bottom-actions">
          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={placingOrder}
          >
            {placingOrder
              ? "⏳ Đang đặt món..."
              : `Đặt món - ${Number(cart!.total)
                  .toFixed(0)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}₫`}
          </button>
          <button
            className="continue-browsing-btn"
            onClick={() => navigate("/customer/order")}
          >
            Tiếp tục xem menu
          </button>
        </div>
      )}

      {/* Dialog Components */}
      <ConfirmDialogComponent />
      <AlertDialogComponent />
    </div>
  );
}

export default ShoppingCart;
