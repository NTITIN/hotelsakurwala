import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS, DEFAULT_HOTEL_INFO } from '../constants/initialData';
import { ROLES, canUserPrintInvoice, canUserManageMenu } from '../constants/roles';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'hotel_billing_auth_user';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default to Admin so the app works seamlessly out of the box, but user can log out to see the login screen
    return DEMO_USERS[0];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Check against authorized administrator credentials (supports 'admin' or 'admin123')
    const user = DEMO_USERS.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail &&
        (u.password === cleanPass || cleanPass === 'admin' || cleanPass === 'admin123')
    );

    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return {
      success: false,
      message: "Invalid credentials. Use the authorized station login: admin@hotel.com / admin"
    };
  };

  const quickLogin = (role) => {
    // Single master administrator account
    const user = DEMO_USERS[0];
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: "Authorized user account not found" };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Allows checking if manager/admin PIN is valid
  const verifyManagerPin = (pin) => {
    const cleanPin = (pin || '').trim();
    if (cleanPin === '9999' || cleanPin === '1234' || (DEMO_USERS[0] && DEMO_USERS[0].pin === cleanPin)) {
      return { success: true, approver: DEMO_USERS[0] };
    }
    return { success: false, message: "Incorrect PIN. Master Admin PIN is 9999." };
  };

  const isAuthorizedToPrint = currentUser ? canUserPrintInvoice(currentUser.role) : false;
  const isAuthorizedToManageMenu = currentUser ? canUserManageMenu(currentUser.role) : false;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        quickLogin,
        logout,
        verifyManagerPin,
        isAuthorizedToPrint,
        isAuthorizedToManageMenu,
        roles: ROLES
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
