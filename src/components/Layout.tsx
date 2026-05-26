import { AnimatePresence, motion } from 'motion/react';
import { Download, Menu, User, UserPlus, X } from 'lucide-react';
import React from 'react';
import { loginAnonymously, loginWithPassword, logout } from '../lib/auth';
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
    { id: 'dashboard', label: '首页' },
    { id: 'showcase', label: '造景展示' },
    { id: 'gallery', label: '图库' },
    { id: 'quotes', label: '报价' },
    { id: 'entry', label: '录入' },
  ].filter((item) => item.id !== 'entry' || (currentUser && !currentUser.isAnonymous));

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

  const accountLabel = currentUser && !currentUser.isAnonymous ? '管理员' : '访客';

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-faint bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:px-10 lg:px-14">
          <button
            onClick={() => handleNavigate('dashboard')}
            className="text-[15px] font-semibold uppercase tracking-[0.16em] text-ink"
          >
            Botanical
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`text-sm font-semibold uppercase tracking-[0.14em] transition-colors ${
                  activeView === item.id ? 'text-accent' : 'text-muted hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            ))}
            {currentUser && !currentUser.isAnonymous && onExport && (
              <button onClick={onExport} className="text-sm font-semibold uppercase tracking-[0.14em] text-muted hover:text-ink">
                导出
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowLoginMenu(!showLoginMenu)}
                className="border border-faint px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink hover:border-ink"
              >
                {accountLabel}
              </button>
              {showLoginMenu && (
                <div className="absolute right-0 top-full mt-2 w-44 border border-faint bg-paper-soft p-2 shadow-[0_18px_40px_rgba(23,20,18,0.08)]">
                  {currentUser && !currentUser.isAnonymous ? (
                    <button
                      onClick={() => { logout(); setShowLoginMenu(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted hover:text-ink"
                    >
                      <UserPlus className="h-4 w-4" />
                      切换为访客
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleLoginAsAdmin}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted hover:text-ink"
                      >
                        <User className="h-4 w-4" />
                        管理员登录
                      </button>
                      {!currentUser && (
                        <button
                          onClick={handleLoginAsVisitor}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted hover:text-ink"
                        >
                          <UserPlus className="h-4 w-4" />
                          游客进入
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="border border-faint p-2 md:hidden"
              aria-label="打开菜单"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="absolute bottom-0 right-0 top-0 w-80 bg-paper p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-[0.16em]">Botanical</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="border border-faint p-2">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`block w-full border-b border-faint py-4 text-left text-3xl font-medium ${
                      activeView === item.id ? 'text-accent' : 'text-ink'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-8 space-y-3">
                {currentUser && !currentUser.isAnonymous && onExport && (
                  <button onClick={onExport} className="ghost-button w-full">
                    <Download className="h-4 w-4" />
                    导出数据
                  </button>
                )}
                {currentUser && !currentUser.isAnonymous ? (
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="editorial-button w-full">
                    切换为访客
                  </button>
                ) : (
                  <button onClick={handleLoginAsAdmin} className="editorial-button w-full">
                    管理员登录
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-16">
        {children}
      </main>

      <PasswordLoginModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onLogin={handlePasswordLogin}
      />
    </div>
  );
}
