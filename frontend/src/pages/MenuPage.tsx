import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tablesAPI, menusAPI, ordersAPI } from "@/lib/api";
import { useCartStore } from "@/store/cart";

export function MenuPage() {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState<any>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotal } =
    useCartStore();

  useEffect(() => {
    loadData();
  }, [qrCode]);

  const loadData = async () => {
    try {
      console.log("Loading data for QR code:", qrCode);

      // Get table info
      const tableRes = await tablesAPI.getByQRCode(qrCode!);
      console.log("Table data:", tableRes.data);
      setTable(tableRes.data);

      // Get tenant ID - handle both string and object
      const tenantId =
        typeof tableRes.data.tenantId === "string"
          ? tableRes.data.tenantId
          : tableRes.data.tenantId?._id;

      console.log("Tenant ID:", tenantId);

      // Get menus
      const menuRes = await menusAPI.getAll(tenantId);
      console.log("Menus data:", menuRes.data);
      setMenus(menuRes.data);

      // Extract categories
      const cats = [...new Set(menuRes.data.map((m: any) => m.category))];
      console.log("Categories:", cats);
      setCategories(cats as string[]);
      if (cats.length > 0) {
        setSelectedCategory(cats[0] as string);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (menu: any) => {
    addItem({
      menuId: menu._id,
      name: menu.name,
      price: menu.price,
      quantity: 1,
    });
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    try {
      // Extract tenantId - handle both string and object
      const tenantId =
        typeof table.tenantId === "string"
          ? table.tenantId
          : table.tenantId?._id;

      const orderData = {
        tableId: table._id,
        tenantId: tenantId,
        items: items.map((item) => ({
          menuId: item.menuId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || "",
        })),
      };

      console.log("Creating order:", orderData);
      const response = await ordersAPI.create(orderData);
      console.log("Order created:", response.data);
      clearCart();
      setShowCart(false);
      // Navigate to order tracking page for this table
      navigate(`/orders/qr/${qrCode}`);
      alert("Đặt hàng thành công!");
    } catch (error: any) {
      console.error("Error creating order:", error);
      console.error("Error details:", error.response?.data);
      alert(
        `Không thể đặt hàng: ${
          error.response?.data?.message || error.message || "Vui lòng thử lại!"
        }`
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  const filteredMenus = menus.filter((m) => m.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-6">
        <h1 className="text-2xl font-bold">Menu - Bàn {table?.tableNumber}</h1>
        <p>{table?.tenantId?.name}</p>
      </div>

      {/* Categories */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenus.map((menu) => (
            <div
              key={menu._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {menu.image && (
                <img
                  src={menu.image}
                  alt={menu.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{menu.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{menu.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-bold text-xl">
                    {menu.price.toLocaleString("vi-VN")}đ
                  </span>
                  <button
                    onClick={() => handleAddToCart(menu)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Button */}
      {items.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowCart(true)}
            className="bg-red-600 text-white px-6 py-4 rounded-full shadow-lg flex items-center gap-2 hover:bg-red-700"
          >
            <span>🛒</span>
            <span className="font-bold">{items.length} món</span>
            <span className="text-sm">
              ({getTotal().toLocaleString("vi-VN")}đ)
            </span>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Giỏ hàng</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Giỏ hàng trống</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div
                      key={item.menuId}
                      className="flex gap-4 bg-gray-50 p-4 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-red-600 font-medium">
                          {item.price.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.menuId, item.quantity - 1);
                            } else {
                              removeItem(item.menuId);
                            }
                          }}
                          className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.menuId, item.quantity + 1)
                          }
                          className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.menuId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-red-600">
                      {getTotal().toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-red-600 text-white py-4 rounded-lg font-bold hover:bg-red-700 text-lg"
                  >
                    Đặt hàng
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg mt-2 hover:bg-gray-300"
                  >
                    Xóa giỏ hàng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
