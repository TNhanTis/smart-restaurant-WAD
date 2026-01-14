import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PaymentStatus.css';

// Hardcoded demo data
const DEMO_BILL = {
    id: 'demo-bill-123',
    status: 'pending', // pending, accepted, completed
    restaurant: {
        name: 'Smart Restaurant - Downtown',
    },
    table: {
        tableNumber: 'T05',
    },
    payment_method: {
        name: 'ZaloPay',
        code: 'zalopay',
    },
    subtotal: 250000,
    tips_amount: 37500,
    total_amount: 287500,
    created_at: new Date().toISOString(),
};

type BillStatus = 'pending' | 'accepted' | 'completed';

function PaymentStatus() {
    const navigate = useNavigate();
    const { billRequestId } = useParams();

    // Demo: Change status every 3 seconds for demonstration
    const [status, setStatus] = useState<BillStatus>('pending');

    // Hardcoded demo - you can change this to test different states
    const bill = { ...DEMO_BILL, status };

    const getStatusConfig = () => {
        switch (status) {
            case 'pending':
                return {
                    icon: '⏳',
                    title: 'Waiting for Waiter',
                    message: 'Your bill request has been sent. A waiter will accept it shortly.',
                    badge: 'Pending',
                    badgeClass: 'pending',
                    showQR: false,
                };
            case 'accepted':
                return {
                    icon: '✅',
                    title: 'Bill Accepted',
                    message: 'Your waiter has accepted your bill request. Please scan the QR code below to complete payment.',
                    badge: 'Accepted',
                    badgeClass: 'accepted',
                    showQR: true,
                };
            case 'completed':
                return {
                    icon: '🎉',
                    title: 'Payment Successful!',
                    message: 'Thank you for dining with us. We hope to see you again soon!',
                    badge: 'Completed',
                    badgeClass: 'completed',
                    showQR: false,
                };
            default:
                return {
                    icon: '⏳',
                    title: 'Processing',
                    message: 'Please wait...',
                    badge: 'Processing',
                    badgeClass: 'pending',
                    showQR: false,
                };
        }
    };

    const statusConfig = getStatusConfig();

    const handleBackToMenu = () => {
        navigate('/customer/order');
    };

    const handleViewOrders = () => {
        navigate('/customer/order-status');
    };

    // Demo: Simulate status progression
    const handleSimulateProgress = () => {
        if (status === 'pending') {
            setStatus('accepted');
        } else if (status === 'accepted') {
            setStatus('completed');
        } else {
            setStatus('pending');
        }
    };

    return (
        <div className="payment-status-container">
            {/* Header */}
            <div className="payment-status-header">
                <button className="payment-status-back-btn" onClick={() => navigate(-1)}>
                    ←
                </button>
                <h1 className="payment-status-title">Payment Status</h1>
            </div>

            <div className="payment-status-content">
                {/* Status Card */}
                <div className="status-card">
                    <div className={`status-icon ${statusConfig.badgeClass}`}>
                        {statusConfig.icon}
                    </div>
                    <h2 className="status-title">{statusConfig.title}</h2>
                    <p className="status-message">{statusConfig.message}</p>
                    <span className={`status-badge ${statusConfig.badgeClass}`}>
                        {statusConfig.badge}
                        {status === 'pending' && (
                            <span className="loading-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        )}
                    </span>
                </div>

                {/* Bill Details */}
                <div className="bill-details-card">
                    <h3 className="bill-details-title">Bill Details</h3>
                    <div className="bill-detail-row">
                        <span className="bill-detail-label">Restaurant</span>
                        <span className="bill-detail-value">{bill.restaurant.name}</span>
                    </div>
                    <div className="bill-detail-row">
                        <span className="bill-detail-label">Table</span>
                        <span className="bill-detail-value">{bill.table.tableNumber}</span>
                    </div>
                    <div className="bill-detail-row">
                        <span className="bill-detail-label">Payment Method</span>
                        <span className="bill-detail-value">{bill.payment_method.name}</span>
                    </div>
                    <div className="bill-detail-row">
                        <span className="bill-detail-label">Subtotal</span>
                        <span className="bill-detail-value">
                            {Math.round(bill.subtotal).toLocaleString('vi-VN')}₫
                        </span>
                    </div>
                    <div className="bill-detail-row">
                        <span className="bill-detail-label">Tips</span>
                        <span className="bill-detail-value">
                            {Math.round(bill.tips_amount).toLocaleString('vi-VN')}₫
                        </span>
                    </div>
                    <div className="bill-detail-row total">
                        <span className="bill-detail-label">Total</span>
                        <span className="bill-detail-value">
                            {Math.round(bill.total_amount).toLocaleString('vi-VN')}₫
                        </span>
                    </div>
                </div>

                {/* QR Code Section (only show when accepted) */}
                {statusConfig.showQR && (
                    <div className="qr-section">
                        <h3 className="qr-title">Scan to Pay</h3>
                        <div className="qr-code-placeholder">
                            📱
                        </div>
                        <p className="qr-instruction">
                            Scan this QR code with your {bill.payment_method.name} app to complete the payment
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="action-buttons">
                    {status === 'completed' ? (
                        <>
                            <button className="action-btn secondary" onClick={handleViewOrders}>
                                View Orders
                            </button>
                            <button className="action-btn primary" onClick={handleBackToMenu}>
                                Back to Menu
                            </button>
                        </>
                    ) : (
                        <button className="action-btn secondary" onClick={() => navigate(-1)}>
                            Cancel Request
                        </button>
                    )}
                </div>

                {/* Demo Control (remove in production) */}
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <button
                        onClick={handleSimulateProgress}
                        style={{
                            padding: '10px 20px',
                            background: '#3498db',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }}
                    >
                        🎬 Demo: Simulate Progress ({status})
                    </button>
                    <p style={{ marginTop: '10px', fontSize: '12px', color: '#7f8c8d' }}>
                        Click to cycle through: Pending → Accepted → Completed
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PaymentStatus;
