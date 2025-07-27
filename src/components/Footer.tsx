
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-nexus-dark/80 border-t border-nexus-blue/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <span className="bg-gradient-to-r from-nexus-blue to-nexus-cyan w-8 h-8 flex items-center justify-center rounded-lg">
                <span className="font-bold text-white">N</span>
              </span>
              <span className="text-xl font-bold text-gradient">Nexus AI</span>
            </Link>
            <p className="text-white/60 text-sm">
              解锁AI超能力：对话、创想、发声，一站搞定！
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">功能</h3>
            <ul className="space-y-2">
              <li><Link to="/chat" className="text-white/60 hover:text-nexus-blue transition">AI 对话</Link></li>
              <li><Link to="/image" className="text-white/60 hover:text-nexus-blue transition">AI 图像生成</Link></li>
              <li><Link to="/voice" className="text-white/60 hover:text-nexus-blue transition">AI 语音合成</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">支持</h3>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-white/60 hover:text-nexus-blue transition">常见问题</Link></li>
              <li><Link to="/contact" className="text-white/60 hover:text-nexus-blue transition">联系我们</Link></li>
              <li><Link to="/pricing" className="text-white/60 hover:text-nexus-blue transition">价格方案</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">法律</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-white/60 hover:text-nexus-blue transition">使用条款</Link></li>
              <li><Link to="/privacy" className="text-white/60 hover:text-nexus-blue transition">隐私政策</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-nexus-blue/20 pt-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-white/60 text-sm">
            &copy; {new Date().getFullYear()} Nexus AI. 保留所有权利.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-white/60 hover:text-nexus-blue transition">
              <span className="sr-only">Weixin</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
            </a>
            <a href="#" className="text-white/60 hover:text-nexus-blue transition">
              <span className="sr-only">Weibo</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/><path d="M10 9a3 3 0 0 0-3 3v5h5a3 3 0 0 0 3-3v-2h-3"></path><path d="M17 9h.01"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
