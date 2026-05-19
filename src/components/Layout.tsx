import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, FileText, Image, LayoutDashboard, Menu, X, LogOut, User, UserPlus, Leaf } from 'lucide-react';
import React from 'react';
import { logout, loginWithPassword, loginAnonymously } from '../lib/firebase';
import { User as UserType } from '../types/user';
import PasswordLoginModal from './PasswordLoginModal';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
  onExport?: () => void;
  currentUser: UserType | null;
}

export default function Layout({ children, activeView, onNavigate, onExport, currentUser }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showLoginMenu, setShowLoginMenu] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  
  const menuItems = [
    { id: 'dashboard', label: '首页', icon: LayoutDashboard },
    { id: 'gallery', label: '产品', icon: Image },
    { id: 'quotes', label: '报价', icon: CreditCard },
    { id: 'entry', label: '数据录入', icon: FileText },
  ].filter(item => {
    if (item.id === 'entry' && (!currentUser || currentUser.isAnonymous)) return false;
    return true;
  });

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  const handleLoginAsAdmin = () => {
    setShowLoginMenu(false);
    setShowPasswordModal(true);
  };

  const handleLoginAsVisitor = async () => {
    await loginAnonymously();
    setShowLoginMenu(false);
  };

  const handlePasswordLogin = async (password: string) => {
    await loginWithPassword(password);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        {/* Centered Title with slight downward position */}
        <div className="flex-1 flex justify-center items-center pt-1">
          <h1 
            className="text-4xl font-semibold cursor-pointer" 
            style={{ fontSize: '38px' }}
            onClick={() => handleNavigate('dashboard')}
          >
            Botanical
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {currentUser && !currentUser.isAnonymous ? (
            <div className="relative">
              <button 
                onClick={() => setShowLoginMenu(!showLoginMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                管理员
              </button>
              {showLoginMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100/50 p-2 min-w-[140px]">
                  <button
                    onClick={() => { logout(); setShowLoginMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    切换为游客
                  </button>
                </div>
              )}
            </div>
          ) : currentUser?.isAnonymous ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                访客模式
              </span>
              <div className="relative">
                <button 
                  onClick={() => setShowLoginMenu(!showLoginMenu)}
                  className="text-sm text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  登录
                </button>
                {showLoginMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100/50 p-2 min-w-[140px]">
                    <button
                      onClick={handleLoginAsAdmin}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      管理员登录
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setShowLoginMenu(!showLoginMenu)}
                className="text-sm text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                登录
              </button>
              {showLoginMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100/50 p-2 min-w-[140px]">
                  <button
                    onClick={handleLoginAsAdmin}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    管理员
                  </button>
                  <button
                    onClick={handleLoginAsVisitor}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    游客
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Desktop Sidebar - Minimal */}
      <aside className="hidden lg:flex fixed left-0 top-14 bottom-0 w-56 flex-col bg-gray-50/30">
        {/* Logo and Title at top */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Botanical</h2>
          </div>
        </div>
        
        <nav className="flex-1 p-4 pt-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                activeView === item.id 
                  ? 'bg-black text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        
        {currentUser && !currentUser.isAnonymous && onExport && (
          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={onExport}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              导出数据
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Botanical</h2>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 hover:bg-gray-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                      activeView === item.id 
                        ? 'bg-black text-white' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="hidden lg:block lg:ml-56 pt-14">
        {children}
      </main>
      
      {/* Mobile Main Content */}
      <main className="lg:hidden pt-14">
        {children}
      </main>

      {/* Password Login Modal */}
      <PasswordLoginModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onLogin={handlePasswordLogin}
      />
    </div>
  );
}
