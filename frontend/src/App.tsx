import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MenuPage } from "./pages/MenuPage";
import { OrderPage } from "./pages/OrderPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { KitchenDisplay } from "./pages/KitchenDisplay";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/menu/:qrCode" element={<MenuPage />} />
        <Route path="/order/:orderId" element={<OrderPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/kitchen" element={<KitchenDisplay />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
