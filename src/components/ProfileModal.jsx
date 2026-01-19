import React, { useState } from 'react';
import {
  User, Mail, Shield, Lock, Save, Loader2, Eye, EyeOff, X,
  Maximize2, Minimize2, RotateCcw
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { authService } from '../services/authService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormModal } from './FormModal';

const ROLE_COLORS = {
  'NOC Lead': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  'NOC Engineer': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  'Support': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  'Viewer': 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
};

export default function ProfileModal({ isOpen, onClose }) {
  const { toast } = useToast();
  const { currentUser } = useStore();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // ... (handlers keep same) ...
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all password fields'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Weak Password',
        description: 'New password must be at least 6 characters'
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password Mismatch',
        description: 'New passwords do not match'
      });
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);

      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully',
        className: 'bg-emerald-600 text-white border-none'
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Change Password',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordForm = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordForm(false);
  };

  if (!isOpen || !currentUser) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      size={isFullscreen ? 'full' : 'lg'}
      showCloseButton={false} // Custom buttons in header
      headerClassName="bg-gradient-to-r from-primary/5 to-accent/5"
      header={
        <>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary flex items-center justify-center text-xl font-black shadow-lg">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">My Profile</h2>
              <p className="text-xs text-muted-foreground">Account Settings & Security</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-6">
        {/* Profile Information */}
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <User size={20} className="text-primary" />
            Profile Information
          </h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground tracking-widest mb-2">
                Full Name
              </label>
              <div className="px-4 py-3 bg-background border border-border rounded-lg">
                <p className="text-sm font-bold text-foreground">{currentUser.name}</p>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground tracking-widest mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-background border border-border rounded-lg">
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
                <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold border ${ROLE_COLORS[currentUser.role]}`}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            {/* User ID */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground tracking-widest mb-2">
                User ID
              </label>
              <div className="px-4 py-3 bg-background border border-border rounded-lg">
                <code className="text-sm font-mono text-foreground">{currentUser.uid}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Lock size={20} className="text-primary" />
              Password & Security
            </h3>
            {!showPasswordForm && (
              <Button
                onClick={() => setShowPasswordForm(true)}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Lock size={16} className="mr-2" />
                Change Password
              </Button>
            )}
          </div>

          {showPasswordForm ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="pl-10 pr-10 bg-background"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="pl-10 pr-10 bg-background"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    className="pl-10 pr-10 bg-background"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleResetPasswordForm}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  <RotateCcw size={16} className="mr-2" />
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <Lock size={48} className="mx-auto mb-3 text-muted-foreground opacity-20" />
              <p className="text-sm text-muted-foreground">
                Click "Change Password" to update your password
              </p>
            </div>
          )}
        </div>
      </div>
    </FormModal>
  );
}

