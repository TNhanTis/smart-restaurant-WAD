import React from 'react';
import Profile from './Profile';
import ProfileGuest from './ProfileGuest';

/**
 * ProfileWrapper - Smart routing component
 * Automatically renders the appropriate profile based on authentication status:
 * - Registered users → Profile.tsx (account info, quick actions)
 * - Guest users → ProfileGuest.tsx (session info, signup benefits)
 */
const ProfileWrapper: React.FC = () => {
    const authToken = localStorage.getItem('auth_token');

    // Registered user → Profile.tsx
    if (authToken) {
        return <Profile />;
    }

    // Guest user → ProfileGuest
    return <ProfileGuest />;
};

export default ProfileWrapper;
