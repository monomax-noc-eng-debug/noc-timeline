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
      if (error.message !== 'Sign-in cancelled' && error.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: error.message
        });
      } else {
        // Optional: Show a gentle info toast or do nothing
        console.log('Google sign-in cancelled by user');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-black p-4 font-sans">
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
          {/* Google Sign-In Button */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="relative w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-3"
            >
              {googleLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-[#0078D4]" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </Button>
          </div>

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
                  className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] placeholder:text-zinc-400"
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
                  className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] placeholder:text-zinc-400"
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
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1">
              <ShieldCheck size={12} />
              Secure Access • Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}