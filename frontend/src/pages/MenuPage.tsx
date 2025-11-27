import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { tablesAPI, menusAPI } from "@/lib/api";
import { useCartStore } from "@/store/cart";

export function MenuPage() {
  const { qrCode } = useParams();
  const [table, setTable] = useState<any>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { items, addItem } = useCartStore();

  useEffect(() => {
    loadData();
  }, [qrCode]);

  const loadData = async () => {
    try {
      // Get table info
      const tableRes = await tablesAPI.getByQRCode(qrCode!);
      setTable(tableRes.data);

      // Get menus
      const menuRes = await menusAPI.getAll(tableRes.data.tenantId);
      setMenus(menuRes.data);

      // Extract categories
      const cats = [...new Set(menuRes.data.map((m: any) => m.category))];
      setCategories(cats as string[]);
      setSelectedCategory(cats[0] as string);
    } catch (error) {
      console.error("Error loading data:", error);
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
          <button className="bg-red-600 text-white px-6 py-4 rounded-full shadow-lg flex items-center gap-2">
            <span>🛒</span>
            <span className="font-bold">{items.length} món</span>
          </button>
        </div>
      )}
    </div>
  );
}
