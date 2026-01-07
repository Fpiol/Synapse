import React, { useState } from 'react';
import StatusBar from './shared/StatusBar';
import svgPaths from "../imports/svg-s5y93igtx2";
import { Input } from './ui/input';
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react';

interface ProfilePageProps {
  onBack: () => void;
  onMenuClick: () => void;
  cartCount: number;
  siteTitle?: string;
}

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  avatarUrl?: string;
}

export default function ProfilePage({ onBack, onMenuClick, cartCount, siteTitle = 'World Peas' }: ProfilePageProps) {
  const [formData, setFormData] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    avatarUrl: ''
  });
  
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    // TODO: Save to Supabase
    console.log('Saving profile:', formData);
    setIsSaved(true);
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const isFormValid = formData.fullName.trim() !== '' && 
                      formData.email.trim() !== '';

  return (
    <div className="bg-[#ffffff] relative size-full">
      {/* Status Bar */}
      <StatusBar />
      
      {/* Header */}
      <div className="absolute bg-[#ffffff] h-[149px] left-0 right-0 top-0 z-10">
        <div className="absolute border-[0px_0px_1px] border-neutral-200 border-solid inset-0 pointer-events-none shadow-[0px_0px_20px_0px_rgba(0,0,0,0.1)]" />
        
        {/* Mobile Nav */}
        <div className="absolute bg-[#ffffff] h-16 left-0 overflow-clip right-0 top-[31px]">
          <div className="absolute bg-[#ffffff] h-[66px] left-0 top-0 w-[393px]" />
          <div
            className="absolute css-v5bt0j flex flex-col font-['Newsreader:Medium',_sans-serif] font-medium justify-center leading-[0] text-[#426b1f] text-[24px] text-center text-nowrap top-9 tracking-[-0.24px] translate-x-[-50%] translate-y-[-50%]"
            style={{ left: "calc(50% - 0.5px)" }}
          >
            <p className="adjustLetterSpacing block leading-none whitespace-pre text-[36px]">{siteTitle || "World Peas"}</p>
          </div>
          
          {/* Cart Icon */}
          <div className="absolute right-5 rounded-2xl size-8 top-[18px]">
            <div className="size-8">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
                <g>
                  <path d={svgPaths.p2003cd00} fill="var(--fill-0, black)" />
                </g>
              </svg>
            </div>
            {cartCount > 0 && (
              <div className="absolute bg-[#426b1f] left-[17px] rounded-lg size-4 top-[-1px]">
                <div className="flex flex-col items-center justify-center relative size-full">
                  <div className="box-border content-stretch flex flex-col gap-2 items-center justify-center px-0.5 py-px relative size-4">
                    <div className="css-78fix6 flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[12px] text-center text-nowrap tracking-[-0.12px]">
                      <p className="adjustLetterSpacing block leading-none whitespace-pre">{cartCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Menu Icon */}
          <button 
            onClick={onMenuClick}
            className="absolute left-5 rounded-2xl size-8 top-[18px] flex items-center justify-center"
          >
            <div className="h-1.5 w-[18px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 8">
                <g>
                  <line stroke="var(--stroke-0, black)" strokeWidth="1.5" x2="18" y1="1.25" y2="1.25" />
                  <line stroke="var(--stroke-0, black)" strokeWidth="1.5" x2="18" y1="7.25" y2="7.25" />
                </g>
              </svg>
            </div>
          </button>
        </div>
        
        {/* Sub Nav */}
        <div className="absolute left-6 right-6 top-[103px]">
          <div className="box-border content-stretch flex flex-col gap-4 items-end justify-end p-0 relative w-full">
            <div className="relative shrink-0 w-full">
              <div className="box-border content-stretch flex flex-row font-normal items-center justify-start leading-[0] p-0 relative text-left w-full">
                <div className="basis-0 css-ip39ex flex flex-col font-['Newsreader:Regular',_sans-serif] grow justify-center min-h-px min-w-px relative shrink-0 text-[#000000] text-[24px] tracking-[-0.48px]">
                  <p className="block leading-[32px]">我的资料</p>
                </div>
                <button 
                  onClick={onBack}
                  className="cursor-pointer flex items-center font-['Inter:Regular',_sans-serif] not-italic relative shrink-0 text-[#426b1f] text-[14px] text-nowrap tracking-[-0.14px]"
                >
                  <div className="flex flex-row items-center gap-2">
                    <div className="w-3 h-3">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                        <path d="M7.5 9L4.5 6L7.5 3" stroke="#426b1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">返回</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="absolute left-0 right-0 top-[169px] bottom-4 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#e8f5e9] flex items-center justify-center overflow-hidden">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-[#426b1f]" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#426b1f] rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[14px] font-['Inter:Regular',_sans-serif] text-[#000000] font-medium">
                <User className="w-4 h-4 text-[#426b1f]" />
                姓名 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="请输入您的姓名"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full h-[48px] px-4 border border-[#e1e1e1] rounded-xl text-[16px] font-['Inter:Regular',_sans-serif] focus:border-[#426b1f] focus:ring-1 focus:ring-[#426b1f]"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[14px] font-['Inter:Regular',_sans-serif] text-[#000000] font-medium">
                <Mail className="w-4 h-4 text-[#426b1f]" />
                邮箱 <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full h-[48px] px-4 border border-[#e1e1e1] rounded-xl text-[16px] font-['Inter:Regular',_sans-serif] focus:border-[#426b1f] focus:ring-1 focus:ring-[#426b1f]"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[14px] font-['Inter:Regular',_sans-serif] text-[#000000] font-medium">
                <Phone className="w-4 h-4 text-[#426b1f]" />
                电话
              </label>
              <Input
                type="tel"
                placeholder="+86 138 0000 0000"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full h-[48px] px-4 border border-[#e1e1e1] rounded-xl text-[16px] font-['Inter:Regular',_sans-serif] focus:border-[#426b1f] focus:ring-1 focus:ring-[#426b1f]"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[14px] font-['Inter:Regular',_sans-serif] text-[#000000] font-medium">
                <MapPin className="w-4 h-4 text-[#426b1f]" />
                地址
              </label>
              <Input
                type="text"
                placeholder="街道地址"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full h-[48px] px-4 border border-[#e1e1e1] rounded-xl text-[16px] font-['Inter:Regular',_sans-serif] focus:border-[#426b1f] focus:ring-1 focus:ring-[#426b1f]"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-[14px] font-['Inter:Regular',_sans-serif] text-[#000000] font-medium">
                城市
              </label>
              <Input
                type="text"
                placeholder="城市名称"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full h-[48px] px-4 border border-[#e1e1e1] rounded-xl text-[16px] font-['Inter:Regular',_sans-serif] focus:border-[#426b1f] focus:ring-1 focus:ring-[#426b1f]"
              />
            </div>

          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={!isFormValid}
              className={`w-full h-[52px] rounded-xl font-['Inter:Medium',_sans-serif] font-medium text-[16px] transition-all ${
                isFormValid
                  ? 'bg-[#426b1f] text-white hover:bg-[#365816] active:scale-[0.98]'
                  : 'bg-[#e1e1e1] text-[#9e9e9e] cursor-not-allowed'
              }`}
            >
              {isSaved ? '✓ 已保存' : '保存资料'}
            </button>
          </div>

          {/* Success Message */}
          {isSaved && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#426b1f] text-white px-6 py-3 rounded-xl shadow-lg z-50">
              <p className="text-[16px] font-['Inter:Medium',_sans-serif]">✓ 资料已保存成功</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}