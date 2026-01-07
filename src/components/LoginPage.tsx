import React, { useState } from 'react';
import StatusBar from './shared/StatusBar';
import { Input } from './ui/input';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onNavigateToSignup: () => void;
  siteTitle?: string;
}

export default function LoginPage({ onLoginSuccess, onNavigateToSignup, siteTitle = 'World Peas' }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { getSupabaseClient } = await import('../utils/supabase/client');
      const supabase = getSupabaseClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (signInError) {
        setError(signInError.message === 'Invalid login credentials' 
          ? '邮箱或密码错误' 
          : signInError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Store session in localStorage
        localStorage.setItem('supabase_access_token', data.session.access_token);
        onLoginSuccess();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('登录失败，请稍后重试');
      setLoading(false);
    }
  };

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  return (
    <div className="bg-[#ffffff] relative size-full">
      {/* Status Bar */}
      <StatusBar />
      
      {/* Header */}
      <div className="absolute bg-[#ffffff] h-[100px] left-0 right-0 top-0">
        <div className="absolute border-[0px_0px_1px] border-neutral-200 border-solid inset-0 pointer-events-none shadow-[0px_0px_20px_0px_rgba(0,0,0,0.1)]" />
        
        {/* Logo */}
        <div className="absolute left-0 right-0 top-[31px] h-16 flex items-center justify-center">
          <div className="flex flex-col font-['Newsreader:Medium',_sans-serif] font-medium justify-center leading-[0] text-[#426b1f] text-[24px] text-center text-nowrap tracking-[-0.24px]">
            <p className="adjustLetterSpacing block leading-none whitespace-pre text-[36px]">{siteTitle}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="absolute left-0 right-0 top-[120px] bottom-0 overflow-y-auto">
        <div className="px-8 py-8">
          
          {/* Welcome Text */}
          <div className="mb-8 text-center">
            <h1 className="text-[28px] font-['Newsreader:Regular',_sans-serif] text-[#000000] mb-2">
              欢迎回来
            </h1>
            <p className="text-[16px] font-['Inter:Regular',_sans-serif] text-[#757575]">
              登录您的账户继续购物
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[14px] font-['Inter:Regular',_sans-serif] text-[#000000] font-medium">
                <Mail className="w-4 h-4 text-[#426b1f]" />
                邮箱
              </label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[52px] px-4 border border-[#e1e1e1] rounded-xl text-[16px] font-['Inter:Regular',_sans-serif] focus:border-[#426b1f] focus:ring-2 focus:ring-[#426b1f]/20"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[14px] font-['Inter:Regular',_sans-serif] text-[#000000] font-medium">
                <Lock className="w-4 h-4 text-[#426b1f]" />
                密码
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="输入您的密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[52px] px-4 pr-12 border border-[#e1e1e1] rounded-xl text-[16px] font-['Inter:Regular',_sans-serif] focus:border-[#426b1f] focus:ring-2 focus:ring-[#426b1f]/20"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#757575] hover:text-[#426b1f] transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-[14px] font-['Inter:Regular',_sans-serif] text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full h-[56px] rounded-xl font-['Inter:Medium',_sans-serif] font-medium text-[16px] transition-all flex items-center justify-center gap-2 ${
                isFormValid && !loading
                  ? 'bg-[#426b1f] text-white hover:bg-[#365816] active:scale-[0.98]'
                  : 'bg-[#e1e1e1] text-[#9e9e9e] cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e1e1e1]"></div>
              </div>
              <div className="relative bg-white px-4">
                <span className="text-[14px] font-['Inter:Regular',_sans-serif] text-[#757575]">
                  或
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-[14px] font-['Inter:Regular',_sans-serif] text-[#757575]">
                还没有账户？{' '}
                <button
                  type="button"
                  onClick={onNavigateToSignup}
                  className="text-[#426b1f] font-medium hover:underline"
                  disabled={loading}
                >
                  立即注册
                </button>
              </p>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}