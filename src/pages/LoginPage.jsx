import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Loader2, UserPlus, Chrome, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { authService } from '../services/authService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCurrentUser } = useStore();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        variant: 'destructive',
        title: 'Missing Credentials',
        description: 'Please enter both email and password'
      });
      return;
    }

    try {
      setLoading(true);
      const userData = await authService.login(formData.email, formData.password);

      setCurrentUser({
        uid: userData.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role
      });

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${userData.name}!`,
        className: 'bg-emerald-600 text-white border-none'
      });

      navigate('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const userData = await authService.loginWithGoogle();

      setCurrentUser({
        uid: userData.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role
      });

      toast({
        title: 'Login Successful',
        description: `Welcome, ${userData.name}!`,
        className: 'bg-emerald-600 text-white border-none'
      });

      navigate('/');
    } catch (error) {
      if (error.message !== 'Sign-in cancelled') {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: error.message
        });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f4f8] dark:bg-black p-4 font-sans">
      <div className="w-full max-w-[400px] bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">

        {/* Header */}
        <div className="px-6 py-6 pb-4 bg-white dark:bg-zinc-900 text-center border-b border-zinc-200 dark:border-zinc-800">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-[#deecf9] text-[#0078D4] mb-3">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white tracking-tight">
            NOC Operations
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Sign in to access the operations dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          {/* Google Sign-In Button */}
          {/* Google Sign-In Button */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            variant="outline"
            className="w-full h-10 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium rounded-md transition-all mb-5 text-zinc-700 dark:text-zinc-300"
          >
            {googleLoading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <Chrome size={18} className="mr-2 text-zinc-600 dark:text-zinc-400" />
                Sign in with Google
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400 font-semibold tracking-wider">
                Or use email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            {/* Email */}
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full h-9 px-3 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-md focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] placeholder:text-zinc-400"
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full h-9 px-3 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-md focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] placeholder:text-zinc-400"
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  disabled={loading || googleLoading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-9 bg-[#0078D4] hover:bg-[#106EBE] text-white font-medium rounded-md shadow-sm transition-all active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} className="mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400 font-semibold tracking-wider">
                New to NOC?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Button
            type="button"
            onClick={() => navigate('/register')}
            variant="ghost"
            className="w-full h-9 text-zinc-600 dark:text-zinc-400 hover:text-[#0078D4] hover:bg-transparent font-medium text-sm transition-all"
          >
            Create New Account
          </Button>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <ShieldCheck size={12} />
              Secure Access • Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}