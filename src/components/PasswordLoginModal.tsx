import React from 'react';
import { Lock, X } from 'lucide-react';

interface PasswordLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => Promise<void>;
}

export default function PasswordLoginModal({ isOpen, onClose, onLogin }: PasswordLoginModalProps) {
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onLogin(password);
      setPassword('');
      onClose();
    } catch {
      setError('密码错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/55 p-5 backdrop-blur-sm">
      <div className="w-full max-w-sm border border-faint bg-paper p-7 shadow-[0_24px_60px_rgba(23,20,18,0.18)]">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="eyebrow mb-2">Admin</p>
            <h2 className="text-2xl font-medium">管理员登录</h2>
          </div>
          <button onClick={onClose} className="border border-faint p-2 hover:border-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Lock className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入管理员密码"
              className="line-input pl-8"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-accent">{error}</p>}

          <button type="submit" disabled={isLoading || !password} className="editorial-button w-full disabled:opacity-50">
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}
