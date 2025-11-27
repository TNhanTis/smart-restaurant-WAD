import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">🍽️ Smart Restaurant</h1>
          <p className="text-2xl mb-12">
            Hệ thống Quản lý Nhà hàng với QR Menu Ordering
          </p>

          <div className="flex justify-center gap-6">
            <Link
              to="/login"
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-red-600 transition"
            >
              Đăng ký Nhà hàng
            </Link>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4">📱 QR Ordering</h3>
              <p>Khách hàng quét QR code để xem menu và đặt món trực tiếp</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4">⚡ Real-time</h3>
              <p>
                Cập nhật trạng thái đơn hàng thời gian thực cho bếp và khách
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4">📊 Analytics</h3>
              <p>Báo cáo doanh số và phân tích chi tiết cho từng nhà hàng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
