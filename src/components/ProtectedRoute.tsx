import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Crown, ShieldAlert } from "lucide-react";
import { hasPermission, type Permission } from "@/lib/studioRoles";

const ProtectedRoute = ({ children, permission }: { children: React.ReactNode; permission?: Permission }) => {
  const { user, studioRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Crown className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (permission && !hasPermission(studioRole, permission)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h1 className="font-bebas text-3xl tracking-wider text-foreground">ACCESS LIMITED</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This workspace is restricted to the appropriate Fully Governed operations role.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
