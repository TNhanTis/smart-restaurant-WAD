import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ordersApi } from '../../api/ordersApi';
import './ProfileGuest.css';

interface SessionStats {
    ordersCount: number;
    sessionTotal: number;
    sessionStart: Date | null;
}

interface UserInfo {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
}

function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [sessionStats, setSessionStats] = useState<SessionStats>({
        ordersCount: 0,
        sessionTotal: 0,
        sessionStart: null,
    });
    const [tableInfo, setTableInfo] = useState<{ tableNumber: string; tableId: string } | null>(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            // Check if user is authenticated
            const authUser = localStorage.getItem('auth_user');
            if (authUser) {
                setIsAuthenticated(true);
                setUserInfo(JSON.parse(authUser));
            }

            // Get table info from localStorage
            const storedTableInfo = localStorage.getItem('table_info');
            if (storedTableInfo) {
                const tableData = JSON.parse(storedTableInfo);
                setTableInfo({
                    tableNumber: tableData.tableNumber,
                    tableId: tableData.id,
                });

                // Fetch orders for this table
                const response = await ordersApi.getByTable(tableData.id);
                const orders = (response as any).data || response;

                if (orders && orders.length > 0) {
                    // Calculate stats
                    const total = orders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0);
                    const oldestOrder = orders[orders.length - 1];

                    setSessionStats({
                        ordersCount: orders.length,
                        sessionTotal: total,
                        sessionStart: oldestOrder?.created_at ? new Date(oldestOrder.created_at) : null,
                    });
                }
            }
        } catch (err) {
            console.error('Failed to load user data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getSessionDuration = () => {
        if (!sessionStats.sessionStart) return 'Just started';

        const now = new Date();
        const diff = now.getTime() - sessionStats.sessionStart.getTime();
        const minutes = Math.floor(diff / 1000 / 60);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} mins`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m`;
    };

    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            // Reload page to continue as guest - preserves cart and session
            window.location.reload();
        }
    };

    if (loading) {
        return (
            <div className="mobile-container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="mobile-container">
            {/* Header */}
            <div className="header">
                <span className="header-title">Profile</span>
                <span className="header-table">
                    {tableInfo ? `Table ${tableInfo.tableNumber}` : ''}
                </span>
            </div>

            {/* Content */}
            <div className="content" style={{ paddingBottom: '100px' }}>
                {/* Profile Card */}
                <div className="profile-card">
                    <div className="profile-avatar" style={isAuthenticated ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontSize: '32px', fontWeight: '700' } : {}}>
                        {isAuthenticated && userInfo ? getInitials(userInfo.full_name) : '👤'}
                    </div>
                    <h2 className="profile-name">
                        {isAuthenticated && userInfo ? userInfo.full_name : 'Welcome, Guest!'}
                    </h2>
                    {isAuthenticated && userInfo ? (
                        <>
                            <p className="profile-email">{userInfo.email}</p>
                            {userInfo.phone && <p className="profile-phone">📱 {userInfo.phone}</p>}
                            <button className="btn-edit-profile" onClick={() => navigate('/customer/profile/edit')}>
                                Edit Profile
                            </button>
                        </>
                    ) : (
                        <p className="profile-subtitle">
                            {tableInfo ? `Table ${tableInfo.tableNumber} • Session Active` : 'No active session'}
                        </p>
                    )}
                </div>

                {/* Session Stats */}
                {tableInfo && (
                    <div className="stats-card">
                        <h3 className="card-title">Current Session</h3>
                        <div className="stats-row">
                            <div className="stat-compact">
                                <span className="stat-icon">🕐</span>
                                <span className="stat-text">{getSessionDuration()}</span>
                            </div>
                            <div className="stat-compact">
                                <span className="stat-icon">📋</span>
                                <span className="stat-text">{sessionStats.ordersCount} orders</span>
                            </div>
                            <div className="stat-compact">
                                <span className="stat-icon">💰</span>
                                <span className="stat-text">{Math.round(Number(sessionStats.sessionTotal)).toLocaleString('vi-VN')}₫</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Account Section */}
                {isAuthenticated ? (
                    <div className="account-card">
                        <h3 className="card-title">Account</h3>
                        <button className="account-btn" onClick={() => navigate('/customer/order-history')}>
                            <span className="account-icon">📦</span>
                            <span className="account-text">Order History</span>
                            <span className="account-arrow">→</span>
                        </button>
                        <button className="account-btn" onClick={() => alert('Change password feature coming soon!')}>
                            <span className="account-icon">🔒</span>
                            <span className="account-text">Change Password</span>
                            <span className="account-arrow">→</span>
                        </button>
                        <button className="account-btn logout" onClick={handleLogout}>
                            <span className="account-icon">🚪</span>
                            <span className="account-text">Logout</span>
                            <span className="account-arrow">→</span>
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Benefits Card for Guest */}
                        <div className="benefits-card">
                            <div className="benefits-header">
                                <span className="benefits-icon">🎁</span>
                                <h3 className="benefits-title">Create Account & Get Benefits</h3>
                            </div>
                            <ul className="benefits-list">
                                <li className="benefit-item">
                                    <span className="benefit-check">✓</span>
                                    Save order history
                                </li>
                                <li className="benefit-item">
                                    <span className="benefit-check">✓</span>
                                    Faster checkout next time
                                </li>
                                <li className="benefit-item">
                                    <span className="benefit-check">✓</span>
                                    Exclusive member discounts
                                </li>
                                <li className="benefit-item">
                                    <span className="benefit-check">✓</span>
                                    Loyalty points & rewards
                                </li>
                            </ul>
                            <div className="benefits-actions">
                                <button className="btn-signup" onClick={() => navigate('/customer/register', { state: { from: location } })}>
                                    Sign Up
                                </button>
                                <button className="btn-login" onClick={() => navigate('/customer/login', { state: { from: location } })}>
                                    Login
                                </button>
                            </div>
                        </div>

                        {/* Help Section for Guest */}
                        <div className="help-card">
                            <h3 className="card-title">Need Help?</h3>
                            <button className="help-button">
                                <span className="help-icon">📞</span>
                                <span className="help-text">Call Waiter</span>
                            </button>
                            <button className="help-button">
                                <span className="help-icon">💬</span>
                                <span className="help-text">Send Feedback</span>
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Navigation - handled by BottomNavigation component */}
        </div>
    );
}

export default Profile;
