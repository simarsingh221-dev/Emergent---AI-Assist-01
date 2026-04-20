import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FlowLogo from "@/components/FlowLogo";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      nav("/app/workspace");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" data-testid="login-page">
      <div className="bg-[#0B0B12] text-white relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2" data-testid="back-home">
            <FlowLogo size={26} />
            <span className="font-heading font-bold text-xl">FlowPilot</span>
          </Link>
        </div>
        <div className="absolute inset-0" style={{background: "radial-gradient(600px 400px at 10% 10%, rgba(123,97,255,0.45), transparent 60%), radial-gradient(500px 400px at 90% 90%, rgba(255,79,216,0.35), transparent 60%), radial-gradient(500px 300px at 50% 50%, rgba(0,212,255,0.25), transparent 60%)"}} />
        <div className="relative z-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-3">§ Agent assist</div>
          <h1 className="font-heading text-4xl font-bold leading-tight">Your agents have a new superpower.</h1>
          <p className="text-neutral-400 mt-4 max-w-md">Sign in to access the live workspace, knowledge base and supervisor insights.</p>
        </div>
        <div className="relative z-10 font-mono text-[10px] uppercase tracking-widest text-neutral-500">© 2026 FlowPilot</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <form onSubmit={submit} className="w-full max-w-sm" data-testid="login-form">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-2">§ Sign in</div>
          <h2 className="font-heading text-3xl font-bold tracking-tight mb-8">Welcome back.</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs uppercase tracking-wider font-mono">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                     className="rounded-none border-black h-11 mt-1.5" data-testid="login-email" />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs uppercase tracking-wider font-mono">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                     className="rounded-none border-black h-11 mt-1.5" data-testid="login-password" />
            </div>
            <Button type="submit" disabled={loading}
                    data-testid="login-submit"
                    className="w-full h-11 bg-black text-white hover:bg-[#7B61FF] rounded-none">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </div>
          <p className="text-sm text-[#525252] mt-6">
            New here? <Link to="/register" className="underline" data-testid="link-register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
