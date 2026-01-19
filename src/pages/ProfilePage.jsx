import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Shield, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button } from '@/components/ui/button';

const ROLE_COLORS = {
  'NOC Lead': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  'NOC Engineer': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'Support': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  'Viewer': 'bg-zinc-50 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser } = useStore();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <header className="shrink-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors mr-3"
          >
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground uppercase tracking-tight">
              My Profile
            </h1>
            <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest leading-none mt-0.5 hidden sm:block">
              Account Information
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid gap-6">
            {/* Profile Information */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <User size={20} className="text-[#0078D4]" />
                Profile Information
              </h2>

              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#0078D4]/10 text-[#0078D4] flex items-center justify-center text-xl font-bold shadow-sm">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{currentUser.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Member since {new Date(currentUser.createdAt || Date.now()).getFullYear()}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground tracking-widest mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border border-border rounded-lg">
                    <Mail size={18} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{currentUser.email}</span>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground tracking-widest mb-2">
                    Role
                  </label>
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-muted-foreground" />
                    <span className={`inline-flex px-3 py-0.5 rounded text-xs font-semibold border ${ROLE_COLORS[currentUser.role]}`}>
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                {/* User ID */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground tracking-widest mb-2">
                    User ID
                  </label>
                  <div className="px-4 py-3 bg-muted/50 border border-border rounded-lg">
                    <code className="text-sm font-mono text-foreground">{currentUser.uid}</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Lock size={20} className="text-[#0078D4]" />
                Security
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Password</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last changed: {new Date(currentUser.updatedAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/profile/change-password')}
                    variant="outline"
                    className="border-[#0078D4] text-[#0078D4] hover:bg-[#0078D4]/5 rounded-md"
                  >
                    <Lock size={16} className="mr-2" />
                    Change Password
                  </Button>
                </div>

                <div className="bg-muted/50 border border-border rounded-md p-4">
                  <h3 className="text-sm font-bold text-foreground mb-2">Security Tips:</h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Use a strong, unique password</li>
                    <li>• Change your password regularly</li>
                    <li>• Never share your password with anyone</li>
                    <li>• Log out when using shared devices</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
