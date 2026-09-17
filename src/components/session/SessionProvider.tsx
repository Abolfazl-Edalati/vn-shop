'use client';

// Session context — bridges the server-side JWT cookie to client components.
// The Header, SellPanel and Account page all read from here instead of
// poking localStorage, since auth state now comes from /api/auth/me.

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export interface SessionUser {
  id: string;
  steamId: string;
  name: string;
  avatar: string;
  tradeUrl: string | null;
  email: string | null;
  wallet: string; // Decimal comes over JSON as string
  role: string;
  createdAt: string;
}

type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: SessionUser };

interface SessionContextValue {
  state: SessionState;
  user: SessionUser | null;
  loading: boolean;
  signInWithSteam: () => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: 'loading' });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (!res.ok) {
        setState({ status: 'anonymous' });
        return;
      }
      const data = await res.json();
      if (data?.user) {
        setState({ status: 'authenticated', user: data.user as SessionUser });
      } else {
        setState({ status: 'anonymous' });
      }
    } catch {
      setState({ status: 'anonymous' });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signInWithSteam = useCallback(() => {
    // the whole flow is a browser redirect — Steam needs to set cookies on steamcommunity.com
    window.location.href = '/api/auth/steam';
  }, []);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/me', { method: 'POST' });
    setState({ status: 'anonymous' });
  }, []);

  const value: SessionContextValue = {
    state,
    user: state.status === 'authenticated' ? state.user : null,
    loading: state.status === 'loading',
    signInWithSteam,
    signOut,
    refresh,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
