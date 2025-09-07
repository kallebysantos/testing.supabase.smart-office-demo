"use client";

import { createContext, useContext, useEffect, useState } from "react";

import type { UserProfile } from "@/types";

// Use the full UserProfile type directly
type DemoUser = UserProfile;

interface AuthContextType {
  user: DemoUser | null;
  userProfile: DemoUser | null;
  loading: boolean;
  signOut: () => void;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo user in localStorage
    const demoUser = localStorage.getItem("demo-user");
    if (demoUser) {
      try {
        const parsedUser = JSON.parse(demoUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing demo user:", error);
        localStorage.removeItem("demo-user");
      }
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    localStorage.removeItem("demo-user");
    setUser(null);
  };

  const refreshProfile = () => {
    // In demo mode, profile is the same as user
    // This is a no-op but kept for compatibility
  };

  const value = {
    user,
    userProfile: user, // In demo mode, user and profile are the same
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
