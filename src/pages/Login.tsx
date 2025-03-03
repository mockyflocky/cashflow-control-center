
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { toast } from "sonner";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      // Error is already handled in the login function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="glass-effect p-6 md:p-8 rounded-xl animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Login Admin</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to manage your finances
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-t-2 border-b-2 border-current rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground mt-6">
            <p>Admin User: admin@example.com / admin123</p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
