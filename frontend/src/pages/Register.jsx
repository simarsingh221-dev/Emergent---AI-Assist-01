import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FlowLogo from "@/components/FlowLogo";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agent" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Workspace created");
      nav("/app/workspace");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" data-testid="register-page">
      <div className="bg-[#0B0B12] text-white relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <FlowLogo size={26} />
          <span className="font-heading font-bold text-xl">FlowPilot</span>
        </Link>
        <div className="absolute inset-0" style={{background: "radial-gradient(600px 400px at 10% 10%, rgba(123,97,255,0.45), transparent 60%), radial-gradient(500px 400px at 90% 90%, rgba(255,79,216,0.35), transparent 60%), radial-gradient(500px 300px at 50% 50%, rgba(0,212,255,0.25), transparent 60%)"}} />
        <div className="relative z-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-3">§ Get started</div>
          <h1 className="font-heading text-4xl font-bold leading-tight">Launch your agent-assist workspace.</h1>
        </div>
        <div className="relative z-10 font-mono text-[10px] uppercase tracking-widest text-neutral-500">© 2026 FlowPilot</div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <form onSubmit={submit} className="w-full max-w-sm" data-testid="register-form">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-2">§ Create account</div>
          <h2 className="font-heading text-3xl font-bold tracking-tight mb-8">Create workspace.</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider font-mono">Full name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                     className="rounded-none border-black h-11 mt-1.5" data-testid="register-name" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-mono">Email</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                     className="rounded-none border-black h-11 mt-1.5" data-testid="register-email" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-mono">Password</Label>
              <Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                     className="rounded-none border-black h-11 mt-1.5" data-testid="register-password" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-mono">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="rounded-none border-black h-11 mt-1.5" data-testid="register-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading}
                    data-testid="register-submit"
                    className="w-full h-11 bg-black text-white hover:bg-[#7B61FF] rounded-none">
              {loading ? "Creating…" : "Create workspace"}
            </Button>
          </div>
          <p className="text-sm text-[#525252] mt-6">
            Already have one? <Link to="/login" className="underline" data-testid="link-login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
