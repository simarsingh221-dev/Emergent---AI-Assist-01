import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserPlus, PencilSimple, Trash, Key, UserCircle, Shield } from "@phosphor-icons/react";

export default function UserManagement() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agent" });
  const [editForm, setEditForm] = useState({ name: "", role: "agent", active: true });
  const [newPassword, setNewPassword] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/users");
      setUsers(r.data);
    } catch (e) {
      if (e?.response?.status === 403) toast.error("Supervisor role required");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users", form);
      toast.success("User created");
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", role: "agent" });
      load();
    } catch (err) { toast.error(err?.response?.data?.detail || "Create failed"); }
  };

  const startEdit = (u) => {
    setEditUser(u);
    setEditForm({ name: u.name, role: u.role, active: u.active !== false });
  };

  const saveEdit = async () => {
    try {
      await api.patch(`/users/${editUser.id}`, editForm);
      toast.success("User updated");
      setEditUser(null);
      load();
    } catch (err) { toast.error(err?.response?.data?.detail || "Update failed"); }
  };

  const doReset = async () => {
    if (newPassword.length < 6) { toast.error("Password must be at least 6 chars"); return; }
    try {
      await api.post(`/users/${resetUser.id}/reset-password`, { new_password: newPassword });
      toast.success(`Password reset for ${resetUser.email}`);
      setResetUser(null); setNewPassword("");
    } catch (err) { toast.error(err?.response?.data?.detail || "Reset failed"); }
  };

  const doDelete = async (u) => {
    if (!window.confirm(`Delete ${u.email}?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      toast.success("User deleted");
      load();
    } catch (err) { toast.error(err?.response?.data?.detail || "Delete failed"); }
  };

  if (me?.role !== "supervisor" && me?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#F4F4F5] p-8" data-testid="users-page">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-2">§ Users</div>
        <h1 className="font-heading text-3xl font-bold tracking-tight mb-4">Access denied.</h1>
        <p className="text-sm text-[#525252]">User management is supervisor-only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] p-8" data-testid="users-page">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252] mb-2">§ Users</div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">Team & access.</h1>
        </div>
        <Button onClick={() => setShowCreate(true)} data-testid="btn-add-user"
                className="rounded-none h-10 brand-gradient-bg text-white hover:opacity-90">
          <UserPlus size={14} className="mr-2" /> Add user
        </Button>
      </div>

      <div className="bg-white border border-[#E5E5E5]">
        <div className="grid grid-cols-12 px-6 py-3 border-b border-[#E5E5E5] font-mono text-[10px] uppercase tracking-widest text-[#525252]">
          <div className="col-span-3">Name</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        <div className="divide-y divide-[#E5E5E5]">
          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-[#A3A3A3]" data-testid="users-loading">Loading…</div>
          ) : users.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-[#A3A3A3]">No users yet.</div>
          ) : users.map((u) => (
            <div key={u.id} data-testid={`user-row-${u.id}`} className="grid grid-cols-12 px-6 py-3 items-center text-sm hover:bg-[#FAFAFA]">
              <div className="col-span-3 flex items-center gap-2 font-medium">
                {u.role === "admin" ? <Shield size={14} weight="fill" className="text-[#FF4FD8]" />
                  : u.role === "supervisor" ? <Shield size={14} className="text-[#7B61FF]" />
                  : <UserCircle size={14} className="text-[#525252]" />}
                {u.name}
              </div>
              <div className="col-span-4 text-[#525252] font-mono text-xs">{u.email}</div>
              <div className="col-span-2"><span className="font-mono text-[10px] uppercase tracking-widest">{u.role}</span></div>
              <div className="col-span-2">
                <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border ${
                  u.active !== false ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-neutral-50 border-neutral-300 text-neutral-500"
                }`}>{u.active !== false ? "active" : "inactive"}</span>
              </div>
              <div className="col-span-1 flex justify-end gap-1">
                <Button size="sm" variant="ghost" onClick={() => startEdit(u)} data-testid={`btn-edit-${u.id}`} className="h-8 w-8 p-0 rounded-none"><PencilSimple size={14} /></Button>
                <Button size="sm" variant="ghost" onClick={() => { setResetUser(u); setNewPassword(""); }} data-testid={`btn-reset-${u.id}`} className="h-8 w-8 p-0 rounded-none"><Key size={14} /></Button>
                {u.id !== me.id && (
                  <Button size="sm" variant="ghost" onClick={() => doDelete(u)} data-testid={`btn-delete-${u.id}`} className="h-8 w-8 p-0 rounded-none hover:text-red-600"><Trash size={14} /></Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create user */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="rounded-none max-w-md" data-testid="dialog-create-user">
          <DialogHeader>
            <DialogTitle className="font-heading">Add user</DialogTitle>
          </DialogHeader>
          <form onSubmit={create} className="space-y-3">
            <div>
              <Label className="text-xs uppercase tracking-wider font-mono">Full name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                     className="rounded-none border-black h-10 mt-1.5" data-testid="create-name" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-mono">Email</Label>
              <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                     className="rounded-none border-black h-10 mt-1.5" data-testid="create-email" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-mono">Temporary password</Label>
              <Input required type="text" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                     className="rounded-none border-black h-10 mt-1.5 font-mono" data-testid="create-password"
                     placeholder="Minimum 6 characters" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-mono">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="rounded-none border-black h-10 mt-1.5" data-testid="create-role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" className="rounded-none h-10" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" data-testid="btn-create-submit" className="rounded-none h-10 brand-gradient-bg text-white hover:opacity-90">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit user */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="rounded-none max-w-md">
          <DialogHeader><DialogTitle className="font-heading">Edit user</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-3">
              <div className="text-xs text-[#525252] font-mono">{editUser.email}</div>
              <div>
                <Label className="text-xs uppercase tracking-wider font-mono">Name</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                       className="rounded-none border-black h-10 mt-1.5" data-testid="edit-name" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider font-mono">Role</Label>
                <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                  <SelectTrigger className="rounded-none border-black h-10 mt-1.5" data-testid="edit-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={editForm.active} onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })} data-testid="edit-active" />
                Account active (inactive users cannot log in)
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-none h-10" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={saveEdit} data-testid="btn-edit-save" className="rounded-none h-10 brand-gradient-bg text-white hover:opacity-90">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset password */}
      <Dialog open={!!resetUser} onOpenChange={(o) => !o && setResetUser(null)}>
        <DialogContent className="rounded-none max-w-sm">
          <DialogHeader><DialogTitle className="font-heading">Reset password</DialogTitle></DialogHeader>
          {resetUser && <div className="text-xs text-[#525252] font-mono mb-2">{resetUser.email}</div>}
          <Input type="text" minLength={6} placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                 className="rounded-none border-black h-10 font-mono" data-testid="reset-password-input" />
          <DialogFooter>
            <Button variant="outline" className="rounded-none h-10" onClick={() => setResetUser(null)}>Cancel</Button>
            <Button onClick={doReset} data-testid="btn-reset-submit" className="rounded-none h-10 brand-gradient-bg text-white hover:opacity-90">Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
