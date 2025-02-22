import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  user: any; // Replace with your user type
  isAuthenticated: boolean;
  setUser: (user: any) => void; // Function to set the user
  setIsAuthenticated: (isAuthenticated: boolean) => void; // Function to set authentication state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const  AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null); // Replace with your user type
  const [isAuthenticated, setIsAuthenticated] = useState(false);




  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setUser, setIsAuthenticated }}>
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