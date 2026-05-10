import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<{ fullName: string; phone: string | null; passwordHint: string } | null>(null);
  const [code, setCode] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [googleFullName, setGoogleFullName] = useState("");
  const [googlePhone, setGooglePhone] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [resendStatus, setResendStatus] = useState("");
  
  const { signIn, signUp, resetPassword, verifyOtp, resendVerification, user, profile, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as any)?.from;
  const redirectTo = fromPath || "/dashboard";

  // Check query/hash params for recovery flow
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (params.get("type") === "recovery" || hashParams.get("type") === "recovery" || window.location.hash.includes("recovery_token")) {
      setIsRecovery(true);
      setIsLogin(false);
      setIsForgotPassword(false);
    }
  }, []);

  // Timer for resend button
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Check if user is already logged in (but not in recovery)
  useEffect(() => {
    if (!loading && user && profile && !isRecovery && !showVerification) {
      const isGoogleUser = user.app_metadata?.provider === "google" || user.identities?.some(i => i.provider === "google");
      if (isGoogleUser && profile.full_name === "New Member") {
        setGoogleFullName(user.user_metadata?.full_name || "");
        setShowProfileCompletion(true);
      } else {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [loading, user, profile, navigate, isRecovery, showVerification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast({ title: "Welcome back 👑" });
      } else {
        if (!firstName || !lastName || !email || !password) {
          toast({ title: "Please fill in all required fields", variant: "destructive" });
          setSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          toast({ title: "Passwords do not match", variant: "destructive" });
          setSubmitting(false);
          return;
        }
        const fullName = `${firstName} ${lastName}`.trim();
        
        // Use signInWithOtp with shouldCreateUser:true to force 6-digit code flow
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
            data: {
              full_name: fullName,
              phone: phone || null,
              password_hint: password, // Store in metadata so we can set it after verification
            },
          },
        });

        if (error) throw error;

        setPendingProfile({ fullName, phone: phone || null, passwordHint: password });
        setShowVerification(true);
        setResendTimer(60);
        toast({ title: "Verification code sent! 📧" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) {
      toast({ title: "Please enter your verification code", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (error) throw error;

      if (data.user && pendingProfile) {
        await supabase.auth.updateUser({ password: pendingProfile.passwordHint });

        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .single();

        if (!existingProfile) {
          await supabase.from('profiles').insert({
            user_id: data.user.id,
            full_name: pendingProfile.fullName,
            phone: pendingProfile.phone || null,
            membership_tier: 'customer',
            loyalty_points: 0,
          });
        }
      }

      toast({ title: "Email verified! Welcome aboard 🚀" });
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      toast({ title: "Verification Failed", description: "Code incorrect or expired. Click resend to get a new one.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { 
          shouldCreateUser: true,
          data: pendingProfile ? {
            full_name: pendingProfile.fullName,
            phone: pendingProfile.phone,
            password_hint: pendingProfile.passwordHint
          } : {}
        },
      });
      if (error) throw error;
      
      setResendTimer(60);
      setResendStatus("New code sent ✓");
      setTimeout(() => setResendStatus(""), 3000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };


  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated successfully" });
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(email);
      toast({ title: "Reset link sent to your email" });
      setIsForgotPassword(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth",
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setGoogleLoading(false);
    }
  };

  const handleProfileCompletion = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await supabase.from("profiles").update({
        full_name: googleFullName || "New Member",
        phone: googlePhone || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      }).eq("user_id", user.id);

      toast({ title: "Profile complete! 🎤" });
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  if (showProfileCompletion) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-4 relative overflow-y-auto">
        <div className="grain-overlay" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto my-auto py-12">
          <div className="text-center mb-8">
            <Crown className="w-10 h-10 text-primary mx-auto mb-3" />
            <h1 className="text-4xl text-foreground">COMPLETE YOUR PROFILE</h1>
            <p className="text-muted-foreground font-barlow mt-1">Just a few details to get started</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 space-y-4 shadow-xl">
            {user?.user_metadata?.avatar_url && (
              <div className="flex justify-center mb-2">
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-16 h-16 rounded-full border-2 border-interactive" />
              </div>
            )}
            <div>
              <Label htmlFor="gName" className="text-muted-foreground uppercase text-[10px] tracking-widest">Display Name</Label>
              <Input id="gName" value={googleFullName} onChange={(e) => setGoogleFullName(e.target.value)} required placeholder="Your name" className="mt-1 bg-background" />
            </div>
            <div>
              <Label htmlFor="gPhone" className="text-muted-foreground uppercase text-[10px] tracking-widest">Phone Number</Label>
              <Input id="gPhone" value={googlePhone} onChange={(e) => setGooglePhone(e.target.value)} placeholder="+44..." className="mt-1 bg-background" />
            </div>
            <Button onClick={handleProfileCompletion} disabled={submitting} className="w-full font-bebas text-lg tracking-wider h-12">
              {submitting ? "..." : "LET'S GO"}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col p-4 relative overflow-y-auto items-center justify-center">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <Button variant="ghost" onClick={() => navigate(fromPath || "/")} className="font-barlow text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 h-10 px-4 rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="grain-overlay" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Crown className="w-12 h-12 text-primary mx-auto mb-4 drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]" />
          <h1 className="text-4xl text-foreground uppercase tracking-widest font-bebas">FULLY GOVERNED</h1>
        </div>

        <div className="bg-card border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {showVerification ? (
                <div className="space-y-6 text-center">
                  <div className="space-y-2">
                    <h2 className="text-2xl text-white font-bebas tracking-wider uppercase">Check Your Email</h2>
                    <p className="text-sm text-muted-foreground font-barlow">
                      We've sent a verification code to:
                    </p>
                    <p className="text-primary font-mono text-base font-semibold">{email}</p>
                    <p className="text-xs text-muted-foreground pt-4">Enter the code below to activate your account.</p>
                  </div>
                  
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter your code"
                      className="w-full text-center text-3xl font-mono tracking-[0.5em] bg-white/5 border border-white/10 rounded-xl px-4 py-5 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-white/10 placeholder:tracking-normal"
                      autoFocus
                    />
                    
                    <div className="space-y-4">
                      <Button type="submit" disabled={submitting || code.length < 4} className="w-full h-12 font-bebas text-xl tracking-widest glow-gold">
                        {submitting ? "VERIFYING..." : "VERIFY ACCOUNT"}
                      </Button>
                      
                      <div className="text-center space-y-2">
                        {resendTimer > 0 ? (
                          <p className="text-xs text-muted-foreground font-mono">Resend code in {resendTimer}s</p>
                        ) : (
                          <button type="button" onClick={handleResendCode} className="text-xs text-primary hover:underline hover:text-interactive transition-all">
                            Didn't get it? Resend code
                          </button>
                        )}
                        {resendStatus && <p className="text-[10px] text-green-500 mt-1 uppercase tracking-tighter">{resendStatus}</p>}
                        <button type="button" onClick={() => { setShowVerification(false); setCode(""); }} className="text-xs text-muted-foreground hover:text-white flex items-center justify-center gap-1 w-full">
                          <ArrowLeft className="w-3 h-3" /> Use a different email
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
            ) : isRecovery ? (
              <motion.form key="recovery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleUpdatePassword} className="space-y-4">
                <p className="text-center text-muted-foreground font-barlow text-sm">Set your new access credentials</p>
                <div>
                  <Label htmlFor="new-password" className="text-muted-foreground uppercase text-[10px] tracking-widest">New Password</Label>
                  <div className="relative mt-1">
                    <Input id="new-password" type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••••" className="bg-background pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={submitting} className="w-full h-12 font-bebas text-xl tracking-widest glow-gold">
                  {submitting ? "SAVING..." : "UPDATE PASSWORD"}
                </Button>
              </motion.form>
            ) : isForgotPassword ? (
              <motion.form key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-center text-muted-foreground font-barlow text-sm">Reset your password via email</p>
                <div>
                  <Label htmlFor="reset-email" className="text-muted-foreground uppercase text-[10px] tracking-widest">Email Address</Label>
                  <Input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="mt-1 bg-background" />
                </div>
                <Button type="submit" disabled={submitting} className="w-full h-12 font-bebas text-xl tracking-widest glow-gold">
                  {submitting ? "..." : "SEND RESET LINK"}
                </Button>
                <button type="button" onClick={() => setIsForgotPassword(false)} className="w-full text-xs text-muted-foreground hover:text-white flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back to Log In
                </button>
              </motion.form>
            ) : (
              <motion.div key="auth-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground font-barlow text-sm">
                    {isLogin ? "Sign in to your account" : "Create your membership"}
                  </p>
                </div>
                
                {!isLogin && (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-lg h-12 font-barlow font-medium text-white hover:bg-white/10 hover:border-primary transition-all disabled:opacity-50 shadow-lg"
                  >
                    <GoogleIcon />
                    {googleLoading ? "Connecting..." : "Continue with Google"}
                  </button>
                )}

                {!isLogin && (
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-mono text-muted-foreground"><span className="bg-card px-2">OR</span></div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="firstName" className="text-muted-foreground uppercase text-[10px] tracking-widest ml-1">First Name</Label>
                          <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="John" className="bg-white/5 border-white/10 h-11" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="lastName" className="text-muted-foreground uppercase text-[10px] tracking-widest ml-1">Last Name</Label>
                          <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Doe" className="bg-white/5 border-white/10 h-11" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-muted-foreground uppercase text-[10px] tracking-widest ml-1">Phone Number (Optional)</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44..." className="bg-white/5 border-white/10 h-11" />
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-muted-foreground uppercase text-[10px] tracking-widest ml-1">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="bg-white/5 border-white/10 h-11" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-muted-foreground uppercase text-[10px] tracking-widest ml-1">Password</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="bg-white/5 border-white/10 h-11 pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-muted-foreground uppercase text-[10px] tracking-widest ml-1">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" className="bg-white/5 border-white/10 h-11" />
                    </div>
                  )}

                  <Button type="submit" disabled={submitting} className="w-full h-12 font-bebas text-xl tracking-widest glow-gold mt-2">
                    {submitting ? "..." : isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
                   </Button>
                </form>

                {isLogin && (
                  <div className="flex flex-col items-center gap-4 pt-2">
                    <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      Forgot your password?
                    </button>
                    
                    <div className="relative w-full py-2">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                      <div className="relative flex justify-center text-[10px] uppercase font-mono text-muted-foreground"><span className="bg-card px-2">OR</span></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading}
                      className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-lg h-12 font-barlow font-medium text-white hover:bg-white/10 hover:border-primary transition-all disabled:opacity-50"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </button>
                  </div>
                )}

                <div className="text-center mt-6">
                  <p className="text-sm text-muted-foreground">
                    {isLogin ? (
                      <>Don't have an account? <button type="button" onClick={() => setIsLogin(false)} className="text-primary hover:underline font-medium">Sign up</button></>
                    ) : (
                      <>Already a member? <button type="button" onClick={() => setIsLogin(true)} className="text-primary hover:underline font-medium">Sign in</button></>
                    )}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <p className="text-center mt-8 text-[10px] uppercase font-mono text-muted-foreground/30 tracking-[3px]">
          &copy; 2026 Fully Governed &bull; All Rights Reserved
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
