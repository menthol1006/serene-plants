import React from 'react';
import { Leaf } from 'lucide-react';
import { motion } from 'motion/react';

interface WelcomeGateProps {
  onVisitorEnter: () => void;
}

export default function WelcomeGate({ onVisitorEnter }: WelcomeGateProps) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 p-10 md:p-14 bg-surface-container rounded-[40px] shadow-2xl border border-outline-variant/30 relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center rotate-6">
              <Leaf className="w-10 h-10 text-primary -rotate-6" />
            </div>
          </div>
          
          <div className="space-y-3 mb-10">
            <h1 className="text-4xl font-serif text-primary tracking-tight">Serene Botanical</h1>
            <p className="text-sm text-on-surface-variant/60 uppercase tracking-[0.2em] font-bold">植物产品管理系统</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={onVisitorEnter}
              className="w-full group relative flex flex-col items-center gap-1 bg-primary text-on-primary p-6 rounded-3xl transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="font-bold text-lg tracking-tight">进入系统</span>
              <p className="text-[10px] text-on-primary/70 font-medium uppercase tracking-widest">本地存储 · 数据安全</p>
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-outline-variant/30 text-left">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">系统说明</h3>
            <ul className="space-y-3 text-[11px] text-on-surface-variant/70 leading-relaxed">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p><b>本地存储</b>：所有数据存储在浏览器本地，无需网络即可使用。</p>
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-outline mt-1.5 shrink-0" />
                <p><b>数据导出</b>：支持一键导出数据备份，确保数据安全。</p>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
      <p className="mt-8 text-[10px] text-on-surface-variant/40 uppercase tracking-[0.3em]">© 2024 Serene Botanical Studio</p>
    </div>
  );
}
