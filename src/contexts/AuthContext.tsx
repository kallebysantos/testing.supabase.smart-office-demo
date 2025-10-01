"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import type { UserProfile } from "@/types";
import { supabase } from "@/lib/api/client";
import { Session } from "@supabase/supabase-js";

type ErrorResult<T> = {
  data: null;
  error: Error;
} | {
  data: T;
  error: null;
};

export const DEMO_USERS = [{
  email: 'paula@deweycheathamhowe.com',
  full_name: `Paula Tejando`,
  department: 'Facilities Management',
  role: 'admin',
  description: 'Full access - all rooms, analytics, alerts, bookings and full sensor data access',
  floor_access: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
},
{
  email: 'chaves@deweycheathamhowe.com',
  full_name: `Chaves del Ocho`,
  department: 'Real Estate',
  role: 'employee',
  description: 'Limited access - cannot see meeting names or attendee details for privacy',
  floor_access: [4, 5, 9, 10,],
}]

export type DemoUser = typeof DEMO_USERS[number];

interface AuthContextType {
  user: UserProfile | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<ErrorResult<UserProfile>>
  switchUser: (newUser: DemoUser) => Promise<ErrorResult<UserProfile>>
  login: (email: string, password: string) => Promise<ErrorResult<UserProfile>
  >;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("session");
    setUser(null);
    setUserSession(null);
  };

  const syncUserSession = useCallback(async () => {
    try {
      const session = localStorage.getItem("session");
      if (session) {
        const parsedSession: Session = JSON.parse(session);

        setUserSession(parsedSession);
        await refreshProfile(parsedSession);
      };
    } catch (error) {
      console.error("Error while sync user session:", error);
      await signOut();
    }
  }, [])

  useEffect(() => {
    syncUserSession().finally(() => setLoading(false));
  }, [syncUserSession]);

  const refreshProfile = async (forceSession?: Session): Promise<ErrorResult<UserProfile>> => {
    // If the 'userSession' may not available if calling 'setUserSession' and then 'refreshProfile' sequentially
    // So callers may supply a forceSession instead
    const session = forceSession || userSession;
    if (!session) {
      return { data: null, error: new Error("undefined 'user session', you must login first.") };
    }

    const { data: userProfile, error: getUserProfileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (getUserProfileError) {
      return { data: null, error: getUserProfileError as Error };
    }

    setUser(userProfile);

    return { data: userProfile as UserProfile, error: null }
  };

  const switchUser = async (newUser: DemoUser): Promise<ErrorResult<UserProfile>> => {
    return await login(newUser.email, "demo123!");
  };

  async function login(email: string, password: string): Promise<ErrorResult<UserProfile>> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password
    });

    if (error) {
      return { data: null, error: error as Error };
    }

    localStorage.setItem("session", JSON.stringify(data.session));
    setUserSession(data.session);

    return await refreshProfile(data.session);
  }

  const value = {
    user,
    userProfile: user, // In demo mode, user and profile are the same
    loading,
    signOut,
    refreshProfile,
    switchUser,
    login,
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
