export function KitchenDisplay() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-8">Kitchen Display System</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-yellow-400 text-lg font-bold mb-4">PENDING</h3>
          <div className="space-y-4">
            <div className="bg-yellow-900 p-4 rounded">
              <p className="font-bold">Đơn #001</p>
              <p className="text-sm">Bàn 5 - 2 món</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-blue-400 text-lg font-bold mb-4">PREPARING</h3>
          <div className="space-y-4">{/* Orders in progress */}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-green-400 text-lg font-bold mb-4">READY</h3>
          <div className="space-y-4">{/* Completed orders */}</div>
        </div>
      </div>
    </div>
  );
}
