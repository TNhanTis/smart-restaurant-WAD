import { useAuthStore } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">
              Đơn hàng hôm nay
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">Doanh thu</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0đ</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">Món ăn</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Quản lý Menu</h2>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Thêm món mới
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Quản lý Bàn & QR</h2>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Tạo QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
