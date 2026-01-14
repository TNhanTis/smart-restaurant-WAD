import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCustomerProfile,
  updateCustomerProfile,
  changeCustomerPassword,
} from '../../api/customersApi';
import './Profile.css';

interface CustomerProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const authUser = localStorage.getItem('auth_user');
      if (!authUser) {
        navigate('/customer/login');
        return;
      }

      const user = JSON.parse(authUser);
      const profileData = await getCustomerProfile(user.id);

      setProfile(profileData);
      setFullName(profileData.full_name);
      setEmail(profileData.email);
      setPhone(profileData.phone || '');
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;

    try {
      setProfileLoading(true);
      setError('');
      setSuccess('');

      const updateData: any = {};
      if (fullName !== profile.full_name) updateData.full_name = fullName;
      if (email !== profile.email) updateData.email = email;
      if (phone !== profile.phone) updateData.phone = phone;

      if (Object.keys(updateData).length === 0) {
        setError('No changes to save');
        return;
      }

      const response = await updateCustomerProfile(profile.id, updateData);
      
      // Update localStorage
      const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
      authUser.full_name = response.data.full_name;
      authUser.email = response.data.email;
      localStorage.setItem('auth_user', JSON.stringify(authUser));

      setProfile(response.data);
      setSuccess(response.message);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    // Validation
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      setError('');
      setSuccess('');

      const response = await changeCustomerPassword(profile.id, {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setSuccess(response.message);
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/customer/login');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('auth_user') || '{}');

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/customer/restaurants')}>
          <span>←</span>
        </button>
        <div className="header-content">
          <h1 className="header-title">Profile</h1>
          <p className="header-subtitle">Manage your account</p>
        </div>
        <button className="logout-header-btn" onClick={handleLogout}>
          <span>🚪</span>
        </button>
      </div>

      {/* Profile Avatar Section */}
      <div className="profile-avatar-section">
        <div className="profile-avatar-large">
          {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h2 className="profile-name">{profile?.full_name}</h2>
        <p className="profile-email">{profile?.email}</p>
        <p className="profile-member-since">
          Member since {new Date(profile?.created_at || '').toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span className="tab-icon">👤</span>
          Profile Info
        </button>
        <button
          className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <span className="tab-icon">🔒</span>
          Password
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {success}
        </div>
      )}

      {/* Content */}
      <div className="profile-content">
        {activeTab === 'profile' ? (
          <form className="profile-form" onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👤</span>
                Full Name
              </label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={2}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📧</span>
                Email
              </label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📞</span>
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={profileLoading}
            >
              {profileLoading ? (
                <>
                  <div className="btn-spinner"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span className="btn-icon">💾</span>
                  Save Changes
                </>
              )}
            </button>
          </form>
        ) : (
          <form className="profile-form" onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔐</span>
                Current Password
              </label>
              <input
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔑</span>
                New Password
              </label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">✓</span>
                Confirm New Password
              </label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <>
                  <div className="btn-spinner"></div>
                  Changing...
                </>
              ) : (
                <>
                  <span className="btn-icon">🔒</span>
                  Change Password
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <button
            className="action-btn"
            onClick={() => navigate('/customer/order-history')}
          >
            <span className="action-icon">📦</span>
            <div className="action-text">
              <h4>Order History</h4>
              <p>View past orders</p>
            </div>
            <span className="action-arrow">→</span>
          </button>

          <button className="action-btn action-btn-logout" onClick={handleLogout}>
            <span className="action-icon">🚪</span>
            <div className="action-text">
              <h4>Logout</h4>
              <p>Sign out of your account</p>
            </div>
            <span className="action-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
