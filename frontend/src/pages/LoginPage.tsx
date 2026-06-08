import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { forgotPassword, resetPassword } from "@/api/auth";
import { getPasswordError } from "@/lib/password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const { login, signup, isAuth } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [forgotStep, setForgotStep] = useState<"email" | "reset">("email");
  const [, setResetToken] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [resetForm, setResetForm] = useState({ token: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPw, setShowResetPw] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isAuth) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "signup") {
        if (form.password !== form.confirmPassword) {
          toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
          return;
        }
        const pwErr = getPasswordError(form.password);
        if (pwErr) {
          toast({ title: "Error", description: pwErr, variant: "destructive" });
          return;
        }
        await signup({
          username: form.username,
          email: form.email,
          password: form.password,
        });
        toast({ title: "Account created", description: "You can now log in", variant: "success" });
        setMode("login");
        setForm({
          username: form.username,
          email: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        await login({ username: form.username, password: form.password });
        navigate("/", { replace: true });
      }
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await forgotPassword(form.email);
      setResetToken(res.reset_token);
      setResetForm({ ...resetForm, token: res.reset_token });
      setForgotStep("reset");
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetForm.password !== resetForm.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    const pwErr = getPasswordError(resetForm.password);
    if (pwErr) {
      toast({ title: "Error", description: pwErr, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword({ token: resetForm.token, new_password: resetForm.password });
      toast({ title: "Password reset", description: "You can now log in with your new password", variant: "success" });
      setMode("login");
      setForgotStep("email");
      setResetToken("");
      setResetForm({ token: "", password: "", confirmPassword: "" });
      setForm({ ...form, email: "", password: "" });
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const enterForgot = () => {
    setMode("forgot");
    setForgotStep("email");
    setResetToken("");
    setResetForm({ token: "", password: "", confirmPassword: "" });
  };

  const backToLogin = () => {
    setMode("login");
    setForgotStep("email");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center justify-center gap-1 mb-8">
            <span className="text-5xl font-bold tracking-tight text-foreground">
          Neco
        </span>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>
            {mode === "login" ? "Login" : mode === "signup" ? "Register" : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Enter your credentials to access your account"
              : mode === "signup"
                ? "Create a new account to get started"
                : forgotStep === "email"
                  ? "Enter your email to receive a reset token"
                  : "Enter the reset token and your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "forgot" ? (
            forgotStep === "email" ? (
              <form onSubmit={handleForgotEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Reset Token"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-token">Reset Token</Label>
                  <Input
                    id="reset-token"
                    value={resetForm.token}
                    onChange={(e) => setResetForm({ ...resetForm, token: e.target.value })}
                    required
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="reset-password"
                      type={showResetPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={resetForm.password}
                      onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPw(!showResetPw)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showResetPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-confirm">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="reset-confirm"
                      type={showResetConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={resetForm.confirmPassword}
                      onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(!showResetConfirm)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showResetConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Your username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                      }
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting
                  ? "Please wait..."
                  : mode === "login"
                    ? "Login"
                    : "Register"}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm text-muted-foreground space-y-2">
            {mode === "forgot" ? (
              <button
                onClick={backToLogin}
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Back to Login
              </button>
            ) : mode === "login" ? (
              <>
                <div>
                  <button
                    onClick={enterForgot}
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Forgot password?
                  </button>
                </div>
                <div>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Register
                  </button>
                </div>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
