import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, Enums } from "@/integrations/supabase/types";
import { mapLegacyRoleToStudioRole, type StudioRole } from "@/lib/studioRoles";

type Profile = Tables<"profiles">;
type AppRole = Enums<"app_role">;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  studioRole: StudioRole;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string, role: AppRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string, type: 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change' | 'email') => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [studioRole, setStudioRole] = useState<StudioRole>("client_artist");
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const [{ data: profileData }, { data: roleData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId).single(),
    ]);
    return { profileData, role: roleData?.role ?? null };
  };

  const applyProfile = (profileData: Profile | null, roleData: AppRole | null) => {
    setProfile(profileData);
    setRole(roleData);
    // Resolve studio role: profile.studio_role takes priority over legacy role
    const profileStudioRole = profileData?.studio_role as StudioRole | null | undefined;
    if (profileStudioRole) {
      setStudioRole(profileStudioRole);
    } else {
      setStudioRole(mapLegacyRoleToStudioRole(roleData));
    }
  };

  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;
    let sessionVersion = 0;

    const applySession = async (nextSession: Session | null, version: number) => {
      if (!mounted || version !== sessionVersion) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(true);

      if (nextSession?.user) {
        try {
          const { profileData, role } = await loadProfile(nextSession.user.id);
          if (mounted && version === sessionVersion) applyProfile(profileData, role);
        } catch {
          if (mounted && version === sessionVersion) applyProfile(null, null);
        }
      } else {
        applyProfile(null, null);
      }

      if (mounted && version === sessionVersion) setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        authEventReceived = true;
        const version = ++sessionVersion;
        setTimeout(() => void applySession(session, version), 0);
      }
    );

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (authEventReceived) return;
        const version = ++sessionVersion;
        void applySession(session, version);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string, _selectedRole: AppRole) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?type=recovery`,
    });
    if (error) throw error;
  };

  const verifyOtp = async (email: string, token: string, type: 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change' | 'email') => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });
    if (error) throw error;
  };

  const resendVerification = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });
    if (error) throw error;
  };

  const refreshProfile = async () => {
    if (user) {
      const { profileData, role } = await loadProfile(user.id);
      applyProfile(profileData, role);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, role, studioRole, loading, signUp, signIn, signOut, resetPassword, verifyOtp, resendVerification, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
