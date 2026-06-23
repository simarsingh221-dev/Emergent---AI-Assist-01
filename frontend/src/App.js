import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Demo from "@/pages/Demo";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import AppShell from "@/components/AppShell";
import AgentWorkspace from "@/pages/AgentWorkspace";
import SupervisorDashboard from "@/pages/SupervisorDashboard";
import KnowledgeBase from "@/pages/KnowledgeBase";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import CallHistory from "@/pages/CallHistory";
import UserManagement from "@/pages/UserManagement";
import WorkflowBuilder from "@/pages/WorkflowBuilder";
import Explorer from "@/pages/Explorer";
import Categories from "@/pages/Categories";
import Scorecard from "@/pages/Scorecard";
import "@/App.css";

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-12 text-sm text-neutral-500 font-mono">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            {/* /register removed — accounts are provisioned by admin via /app/users */}
            <Route path="/register" element={<Navigate to="/contact" replace />} />
            <Route path="/app" element={<Private><AppShell /></Private>}>
              <Route index element={<Navigate to="/app/workspace" replace />} />
              <Route path="workspace" element={<AgentWorkspace />} />
              <Route path="workspace/:callId" element={<AgentWorkspace />} />
              <Route path="supervisor" element={<SupervisorDashboard />} />
              <Route path="history" element={<CallHistory />} />
              <Route path="kb" element={<KnowledgeBase />} />
              <Route path="workflows" element={<WorkflowBuilder />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="explorer" element={<Explorer />} />
              <Route path="categories" element={<Categories />} />
              <Route path="scorecard" element={<Scorecard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </HelmetProvider>
  );
}
