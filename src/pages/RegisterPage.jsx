import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, ArrowLeft, Loader2, Chrome, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import { useStore } from '../store/useStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCurrentUser } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all required fields'
      });
      return;
    }

    // ✅ Email Domain Validation - ปฏิเสธ email ที่ไม่เป็นทางการ
    const invalidDomains = [
      'test.com', 'test', 'example.com', 'example',
      'admin.com', 'admin', 'demo.com', 'demo',
      'temp.com', 'temporary.com', 'fake.com',
      'sample.com', 'localhost', 'dummy.com',
      'mailinator.com', 'guerrillamail.com', '10minutemail.com',
      'throwaway.email', 'tempmail.com', 'yopmail.com'
    ];

    const emailDomain = formData.email.split('@')[1]?.toLowerCase();

    if (!emailDomain || invalidDomains.includes(emailDomain)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email Domain',
        description: 'Please use a valid professional email address. Test emails (e.g., @test, @admin, @example) are not allowed.'
      });
      return;
    }

    // ตรวจสอบว่าเป็น email format ที่ถูกต้อง
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email Format',
        description: 'Please enter a valid email address (e.g., name@company.com)'
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

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password Mismatch',
        description: 'Passwords do not match'
      });
      return;
    }

    try {
      setLoading(true);
      const userData = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'Viewer' // Default role, can be changed by admin
      });

      // Auto login after registration
      setCurrentUser(userData);

      toast({
        title: 'Registration Successful',
        description: `Welcome to NOC Operations, ${userData.name}!`,
        className: 'bg-emerald-600 text-white border-none'
      });

      navigate('/');
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

  const handleGoogleSignup = async () => {
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
        title: 'Registration Successful',
        description: `Welcome, ${userData.name}!`,
        className: 'bg-emerald-600 text-white border-none'
      });

      navigate('/');
    } catch (error) {
      if (error.message !== 'Sign-in cancelled') {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: error.message
        });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f4f8] dark:bg-black p-4 font-sans">
      <div className="w-full max-w-[480px] bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">

        {/* Header */}
        <div className="relative px-6 py-6 pb-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => navigate('/login')}
            className="absolute top-4 left-4 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center pt-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-[#deecf9] text-[#0078D4] mb-3">
              <UserPlus size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white tracking-tight">
              Join NOC Team
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              Create your account to access the dashboard
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          {/* Google Sign-Up Button */}
          <Button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            variant="outline"
            className="w-full h-10 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium rounded-md transition-all mb-5 text-zinc-700 dark:text-zinc-300"
          >
            {googleLoading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Creating account...
              </>
            ) : (
              <>
                <Chrome size={18} className="mr-2 text-zinc-600 dark:text-zinc-400" />
                Sign up with Google
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
                Or fill in details
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <Input
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full h-9 px-3 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-md focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] placeholder:text-zinc-400"
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Input
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full h-9 px-3 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-md focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] placeholder:text-zinc-400"
                  disabled={loading || googleLoading}
                />
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                Use professional email. No test domains (@test, @admin).
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full h-9 px-3 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-md focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] placeholder:text-zinc-400"
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  disabled={loading || googleLoading}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-md p-3">
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
                <strong className="text-zinc-700 dark:text-zinc-300">Note:</strong> New accounts are created with Viewer role by default.
              </p>
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
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={18} className="mr-2" />
                  Create Account
                </>
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-xs text-zinc-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-semibold text-[#0078D4] hover:underline transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
