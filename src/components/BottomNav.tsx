import React from 'react';
import { Home, ShoppingCart, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'cart' | 'profile';
  cartCount: number;
  isLoggedIn: boolean;
  userInfo?: {
    fullName: string;
    avatarUrl?: string;
  };
  onTabChange: (tab: 'home' | 'cart' | 'profile') => void;
}

export default function BottomNav({ 
  activeTab, 
  cartCount, 
  isLoggedIn, 
  userInfo,
  onTabChange 
}: BottomNavProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-[#e1e1e1] shadow-[0px_-2px_20px_0px_rgba(0,0,0,0.08)] z-30">
      <div className="flex items-center justify-around h-full px-4">
        
        {/* Home Tab */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
            activeTab === 'home' ? 'text-[#426b1f]' : 'text-[#757575]'
          }`}
        >
          <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-[#426b1f]' : ''}`} />
          <span className="text-[11px] font-['Inter:Regular',_sans-serif]">
            首页
          </span>
        </button>

        {/* Cart Tab */}
        <button
          onClick={() => onTabChange('cart')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 relative transition-colors ${
            activeTab === 'cart' ? 'text-[#426b1f]' : 'text-[#757575]'
          }`}
        >
          <div className="relative">
            <ShoppingCart className={`w-6 h-6 ${activeTab === 'cart' ? 'fill-[#426b1f]' : ''}`} />
            {cartCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-[#426b1f] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                <span className="text-[10px] font-['Inter:Bold',_sans-serif] font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              </div>
            )}
          </div>
          <span className="text-[11px] font-['Inter:Regular',_sans-serif]">
            购物车
          </span>
        </button>

        {/* Profile/Login Tab */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
            activeTab === 'profile' ? 'text-[#426b1f]' : 'text-[#757575]'
          }`}
        >
          {isLoggedIn && userInfo ? (
            <>
              {userInfo.avatarUrl ? (
                <img 
                  src={userInfo.avatarUrl} 
                  alt={userInfo.fullName}
                  className={`w-6 h-6 rounded-full object-cover ${
                    activeTab === 'profile' ? 'ring-2 ring-[#426b1f]' : ''
                  }`}
                />
              ) : (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-['Inter:Medium',_sans-serif] font-medium text-[12px] ${
                  activeTab === 'profile' 
                    ? 'bg-[#426b1f] text-white ring-2 ring-[#426b1f]' 
                    : 'bg-[#e1e1e1] text-[#757575]'
                }`}>
                  {userInfo.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[11px] font-['Inter:Regular',_sans-serif] max-w-[60px] truncate">
                {userInfo.fullName}
              </span>
            </>
          ) : (
            <>
              <User className={`w-6 h-6 ${activeTab === 'profile' ? 'fill-[#426b1f]' : ''}`} />
              <span className="text-[11px] font-['Inter:Regular',_sans-serif]">
                登录
              </span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
