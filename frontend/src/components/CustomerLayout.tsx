import { useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout = ({ children }: CustomerLayoutProps) => {
  const location = useLocation();

  // Determine active tab based on current path
  const getActiveTab = (): 'menu' | 'cart' | 'orders' | 'profile' | undefined => {
    if (location.pathname.includes('/customer/order') && !location.pathname.includes('/order-status') && !location.pathname.includes('/order-history')) {
      return 'menu';
    }
    if (location.pathname.includes('/customer/cart')) {
      return 'cart';
    }
    if (location.pathname.includes('/customer/order-status') || location.pathname.includes('/customer/order-history')) {
      return 'orders';
    }
    if (location.pathname.includes('/customer/profile')) {
      return 'profile';
    }
    return undefined;
  };

  const activeTab = getActiveTab();

  return (
    <>
      {children}
      {activeTab && <BottomNavigation activeTab={activeTab} />}
    </>
  );
};

export default CustomerLayout;
