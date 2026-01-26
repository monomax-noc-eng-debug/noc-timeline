import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Edit2, Trash2, Save, X, ArrowLeft, Loader2,
  Mail, Shield, UserCheck, Search, Filter, Eye
} from 'lucide-react';
import { authService } from '../services/authService';
import { useStore } from '../store/useStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { hasRole, ROLES } from '../utils/permissions';
import RoleSelector from '../components/RoleSelector';
import { FormModal } from '../components/FormModal';
import ConfirmModal from '../components/ui/ConfirmModal';

const ROLE_COLORS = {
  'NOC Lead': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  'NOC Engineer': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'Support': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  'Viewer': 'bg-zinc-50 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
};

const ROLE_OPTIONS = ['NOC Lead', 'NOC Engineer', 'Support', 'Viewer'];

export default function TeamManagementPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useStore();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  const canEdit = hasRole(currentUser, [ROLES.LEAD]);

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await authService.getAllUsers();
      setUsers(allUsers.filter(u => u.isActive));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to load users',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const [deleteTargetUser, setDeleteTargetUser] = useState(null);

  const handleDeleteUser = (user) => {
    if (!canEdit) return;
    setDeleteTargetUser(user);
  };

  const confirmDeleteUser = async () => {
    if (!deleteTargetUser) return;

    try {
      await authService.deleteUser(deleteTargetUser.uid);
      toast({
        title: 'User Deactivated',
        description: 'User has been deactivated successfully',
        className: 'bg-emerald-600 text-white border-none'
      });
      loadUsers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to deactivate user',
        description: error.message
      });
    } finally {
      setDeleteTargetUser(null);
    }
  };

  const handleUpdateUser = async (uid, updates) => {
    if (!canEdit) return;

    try {
      await authService.updateUser(uid, updates);
      toast({
        title: 'User Updated',
        description: 'User profile has been updated',
        className: 'bg-emerald-600 text-white border-none'
      });
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to update user',
        description: error.message
      });
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
          <p className="text-muted-foreground font-medium">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-zinc-50 dark:bg-black flex flex-col">
      {/* Header */}
      <header className="shrink-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft size={20} className="text-zinc-500 dark:text-zinc-400" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                Team Management
              </h1>
              <p className="text-[10px] font-medium uppercase text-zinc-500 dark:text-zinc-400 tracking-widest leading-none mt-0.5 hidden sm:block">
                NOC Staff Directory & Access Control
              </p>
            </div>
          </div>
          {canEdit && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#0078D4] hover:bg-[#106EBE] text-white font-semibold rounded-md shadow-sm h-9 sm:h-9"
            >
              <Plus size={16} className="mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Add Member</span>
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-9 rounded-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm font-medium outline-none focus:ring-1 focus:ring-[#0078D4] transition-shadow"
              >
                <option>All</option>
                {ROLE_OPTIONS.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Total</p>
              <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mt-1">{users.length}</p>
            </div>
            {ROLE_OPTIONS.map(role => (
              <div key={role} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest truncate">{role}</p>
                <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mt-1">
                  {users.filter(u => u.role === role).length}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-100/50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.uid}
                      onClick={() => setViewingUser(user)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0078D4]/10 text-[#0078D4] flex items-center justify-center text-xs font-bold shadow-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              ID: {user.uid.substring(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail size={14} />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={cn(
                          "inline-flex px-2.5 py-0.5 rounded text-[10px] font-semibold border",
                          ROLE_COLORS[user.role]
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5">
                          <UserCheck size={14} className="text-emerald-500" />
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Active
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Users size={48} className="opacity-20" />
                        <p className="text-sm font-medium">No members found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.uid} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0078D4]/10 text-[#0078D4] flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-foreground truncate">{user.name}</h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                            <Mail size={12} />
                            {user.email}
                          </p>
                        </div>
                        {canEdit && (
                          <button
                            onClick={() => setViewingUser(user)}
                            className="p-1.5 text-[#0078D4] hover:bg-[#0078D4]/10 rounded-md transition-colors shrink-0"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border",
                          ROLE_COLORS[user.role]
                        )}>
                          {user.role}
                        </span>
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <UserCheck size={12} />
                          <span className="text-[10px] font-semibold">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card border border-border rounded-md p-12 text-center">
                <Users size={48} className="opacity-20 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No members found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {
        showAddModal && (
          <AddMemberModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              loadUsers();
            }}
          />
        )
      }

      {/* View/Edit Member Modal (Mobile) */}
      {
        viewingUser && (
          <ViewMemberModal
            user={viewingUser}
            onClose={() => setViewingUser(null)}
            onUpdate={(updates) => {
              handleUpdateUser(viewingUser.uid, updates);
              setViewingUser(null);
            }}
            onDelete={() => {
              handleDeleteUser(viewingUser.uid);
              setViewingUser(null);
            }}
          />
        )
      }
      {/* Confirm Deactivate Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetUser}
        onClose={() => setDeleteTargetUser(null)}
        onConfirm={confirmDeleteUser}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${deleteTargetUser?.name}? They will no longer be able to log in.`}
        isDanger
        confirmText="Deactivate"
      />
    </div >
  );
}

// Add Member Modal Component
function AddMemberModal({ onClose, onSuccess }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'NOC Engineer'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all required fields'
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Weak Password',
        description: 'Password must be at least 6 characters'
      });
      return;
    }

    try {
      setLoading(true);
      await authService.register(formData);
      toast({
        title: 'Member Added',
        description: `${formData.name} has been added to the team`,
        className: 'bg-emerald-600 text-white border-none'
      });
      onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      title="Add New Member"
      description="Create a new team member account"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">
            Full Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            className="bg-zinc-100/50 dark:bg-zinc-800/50"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            Email Address *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            className="bg-zinc-100/50 dark:bg-zinc-800/50"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            Password *
          </label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Minimum 6 characters"
            className="bg-muted/50"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            Role *
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full h-10 px-3 bg-muted/50 border border-border rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          >
            {ROLE_OPTIONS.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2" />
                Add Member
              </>
            )}
          </Button>
        </div>
      </form>
    </FormModal>
  );
}

// View Member Modal Component (Mobile)
function ViewMemberModal({ user, onClose, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(user.role);

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      title="Member Details"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary flex items-center justify-center text-xl font-black shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{user.name}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">ID: {user.uid.substring(0, 8)}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-widest mb-2">
            Email
          </label>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Mail size={16} className="text-muted-foreground" />
            {user.email}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground tracking-widest mb-2">
            Role
          </label>
          {editing ? (
            <RoleSelector
              value={role}
              onChange={setRole}
            />
          ) : (
            <span className={cn(
              "inline-flex px-3 py-1.5 rounded-full text-xs font-bold border",
              ROLE_COLORS[user.role]
            )}>
              {user.role}
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground tracking-widest mb-2">
            Status
          </label>
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-emerald-500" />
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Active
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          {editing ? (
            <>
              <Button
                onClick={() => {
                  setEditing(false);
                  setRole(user.role);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onUpdate({ role });
                  setEditing(false);
                }}
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Save size={16} className="mr-2" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setEditing(true)}
                variant="outline"
                className="flex-1"
              >
                <Edit2 size={16} className="mr-2" />
                Edit Role
              </Button>
              <Button
                onClick={onDelete}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 size={16} className="mr-2" />
                Deactivate
              </Button>
            </>
          )}
        </div>
      </div>
    </FormModal>
  );
}
