import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// 星空canvas
const useStars = (canvasRef: React.RefObject<HTMLCanvasElement>, color: string = "#18ffff") => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = window.innerWidth, h = window.innerHeight;
    let stars: {
      x: number; y: number; r: number; o: number; twinkle: number;
    }[] = [];
    function resizeStars() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w; canvas.height = h;
      stars = [];
      for (let i = 0; i < (w * h) / 1200; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.1 + 0.3,
          o: Math.random() * 0.7 + 0.3,
          twinkle: Math.random() * 2 * Math.PI
        });
      }
    }
    function drawStars() {
      ctx.clearRect(0,0,w,h);
      for (let s of stars) {
        ctx.save();
        ctx.globalAlpha = s.o + 0.30*Math.sin(Date.now()/700 + s.twinkle);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 2*Math.PI);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 7;
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(drawStars);
    }
    resizeStars();
    drawStars();
    window.addEventListener('resize', resizeStars);
    return () => window.removeEventListener('resize', resizeStars);
  }, [canvasRef, color]);
};

const useClock = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const pad = (n: number) => (n < 10 ? "0" + n : n);
    const tick = () => {
      const now = new Date();
      setTime(
        `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return time;
};

const cards = [
  {
    icon: "💬",
    title: "AI智能对话",
    desc: "强大的AI聊天助手，可以回答问题、提供创意建议、编写文本，甚至帮你解决复杂问题，无需限制。",
    btn: "开始对话",
    to: "/chat",
    border: "from-cyan-400 to-cyan-300",
    btnFg: "text-cyan-300 border-cyan-300 hover:bg-cyan-300 hover:text-[#181a2e]"
  },
  {
    icon: "🎨",
    title: "AI图像生成",
    desc: "将想法转化为艺术作品，只需输入文本描述，AI为你创作惊艳图像。支持多风格/高分辨率导出。",
    btn: "生成图像",
    to: "/image",
    border: "from-pink-400 to-pink-500",
    btnFg: "text-pink-400 border-pink-400 hover:bg-pink-400 hover:text-white"
  },
  {
    icon: "🔊",
    title: "AI语音合成",
    desc: "文本一键变语音。多语言多风格，创作、教育或个人用途皆可自如输出音频。",
    btn: "转换语音",
    to: "/voice",
    border: "from-purple-400 to-purple-500",
    btnFg: "text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white"
  }
];

const HeroSection = () => {
  const starsCanvas = useRef<HTMLCanvasElement>(null);
  useStars(starsCanvas, "#18ffff");
  const time = useClock();

  return (
    <section className="relative flex flex-col items-center bg-[#0e1020] overflow-x-hidden pt-3 pb-16">
      {/* 星空背景层 */}
      <canvas ref={starsCanvas} className="pointer-events-none fixed inset-0 w-full h-full z-0" />

      {/* 右上角注册/登录 */}
      <div className="fixed z-30 top-6 right-8 flex gap-3">
        <Link
          to="/register"
          className="
            px-5 py-2 rounded-lg border-2 border-[#34eafa] text-[#1cdfff] font-bold
            bg-[#0e151f] hover:bg-[#1cdfff] hover:text-[#182d3d] transition-all
            text-base
          ">
          注册
        </Link>
        <Link
          to="/login"
          className="
            px-5 py-2 rounded-lg border-2 border-[#60aaff] text-[#60aaff] font-bold
            bg-[#0e151f] hover:bg-[#60aaff] hover:text-[#182d3d] transition-all
            text-base
          ">
          登录
        </Link>
      </div>

      {/* 顶部时钟 */}
      <div
        className="absolute top-8 left-10 text-sm px-6 py-1.5 rounded-md border border-cyan-300 bg-cyan-300/5 text-cyan-200 font-mono shadow z-10 select-none"
        style={{ letterSpacing: "0.15em" }}
      >
        {time}
      </div>
      
      {/* 主title与副标题 */}
      <header className="mt-14 md:mt-24 text-center z-10 relative mb-4">
        <div
          className="font-black text-3xl md:text-5xl bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent tracking-wide"
          style={{
            fontFamily:
              "'Montserrat', 'PingFang SC', 'Microsoft YaHei', sans-serif",
            letterSpacing: 6,
            userSelect: "none",
          }}
        >
          Nexus AI
        </div>
        <div className="text-lg md:text-2xl font-medium text-[#d1d5fa] tracking-wide mt-3 mb-4">
          探索未来　·　释放创造力
          <div className="w-[60%] h-1 mx-auto mt-3 rounded bg-gradient-to-r from-cyan-300 to-pink-400"></div>
        </div>
      </header>

      {/* 内容卡片区 - 适当增加下方空白 */}
      <div className="flex flex-row flex-wrap gap-6 md:gap-8 justify-center items-center max-w-[1100px] w-full px-4 mx-auto mt-2 md:mt-2 mb-16 z-10 relative">
        {cards.map((card, i) => (
          <div
            key={card.title}
            className={`
              group relative 
              bg-[rgba(20,22,46,0.98)] rounded-[18px] shadow-xl border-2 border-transparent 
              transition-all duration-300 min-w-[280px] max-w-[320px] h-[280px] flex-1 px-8 py-8 mx-1
              flex flex-col items-center justify-between
              hover:scale-105 hover:shadow-[0_8px_36px_0_rgba(24,255,255,0.15)]
              ${i === 0
                ? "hover:border-cyan-400"
                : i === 1
                ? "hover:border-pink-400"
                : "hover:border-purple-400"
              }
            `}
            style={{
              borderImage: `linear-gradient(120deg,${
                i === 0
                  ? "#18ffff 0%,#54bfff 100%"
                  : i === 1
                  ? "#ff3c8e 0%,#ff73cc 100%"
                  : "#a259ff 0%,#60f 100%"
              }) 1`
            }}
          >
            <div className={`card-icon text-3xl mb-2 ${i===0?"text-cyan-400":i===1?"text-pink-400":"text-purple-400"}`}>
              <span>{card.icon}</span>
            </div>
            <div className="card-title flex items-center mb-1 font-extrabold text-base md:text-lg text-white">
              <strong className="mr-2 font-black text-xl">AI</strong> {card.title.replace("AI","")}
            </div>
            <div className="card-desc text-[0.96rem] text-[#b4c7da] leading-6 mb-2 text-center min-h-[48px]">
              {card.desc}
            </div>
            <Link to={card.to}
              className={`
                mt-1 block text-center border-2 font-bold py-1.5 px-7 rounded-xl text-base transition
                ${i===0?"border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-[#182d3d]":i===1?"border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white":"border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"}
                `}
              >{card.btn}</Link>
          </div>
        ))}
      </div>

      {/* 浮动语言球 */}
      <div
        className="fixed right-6 top-[48%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border-2 border-cyan-300 text-cyan-400 flex items-center justify-center text-base shadow cursor-pointer select-none"
        title="语言"
        style={{ fontFamily: "inherit" }}
      >𐰴</div>
    </section>
  );
};

export default HeroSection;
