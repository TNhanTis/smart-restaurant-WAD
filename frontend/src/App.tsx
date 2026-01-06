import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import TableManagement from "./pages/TableManagement";
import Menu from "./pages/Menu";
import CategoriesManagement from "./pages/CategoriesManagement";
import ModifiersManagement from "./pages/ModifiersManagement";
import MenuItemsManagement from "./pages/MenuItemsManagement";
import CustomerLogin from "./pages/customer/Login";
import CustomerRegister from "./pages/customer/Register";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin Routes */}
          <Route path="/" element={<><Navigation /><TableManagement /></>} />
          <Route path="/menu" element={<><Navigation /><Menu /></>} />
          <Route path="/categories" element={<><Navigation /><CategoriesManagement /></>} />
          <Route path="/modifiers" element={<><Navigation /><ModifiersManagement /></>} />
          <Route path="/items" element={<><Navigation /><MenuItemsManagement /></>} />
          
          {/* Customer Routes */}
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/customer/register" element={<CustomerRegister />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
