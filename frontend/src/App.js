import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Demo from "@/pages/Demo";
import AppShell from "@/components/AppShell";
import AgentWorkspace from "@/pages/AgentWorkspace";
import SupervisorDashboard from "@/pages/SupervisorDashboard";
import KnowledgeBase from "@/pages/KnowledgeBase";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import CallHistory from "@/pages/CallHistory";
import "@/App.css";

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-12 text-sm text-neutral-500 font-mono">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/app" element={<Private><AppShell /></Private>}>
            <Route index element={<Navigate to="/app/workspace" replace />} />
            <Route path="workspace" element={<AgentWorkspace />} />
            <Route path="workspace/:callId" element={<AgentWorkspace />} />
            <Route path="supervisor" element={<SupervisorDashboard />} />
            <Route path="history" element={<CallHistory />} />
            <Route path="kb" element={<KnowledgeBase />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
