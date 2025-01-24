'use client'
import React, { createContext, useState, useContext } from 'react';

// Define the shape of the context
type AuthContextType = {
  loggedIn: boolean;
  registered: boolean,
  setRegistered: () => void;
  setLoggedIn: () => void;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  loggedIn: false, // Default logged-in status
  registered: false,
  setRegistered: () => {},
  setLoggedIn: () => {}, // Placeholder function
});

// Create the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loggedIn, setLoggedInState] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Define the function to toggle the logged-in state
  const toggleLoggedIn = () => {
    setLoggedInState((prev) => !prev);
  };

  const toggleRegistered = () => {
    setRegistered((prev) => !prev)
  }

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn: toggleLoggedIn, registered, setRegistered : toggleRegistered}}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
