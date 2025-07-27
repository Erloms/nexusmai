
import React from 'react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: '李明',
      role: '内容创作者',
      quote: 'Nexus AI的图像生成功能帮我节省了大量寻找素材的时间，只需几秒钟就能创建高质量的插图。',
      avatar: '👨‍🎨'
    },
    {
      name: '张晓华',
      role: '市场营销主管',
      quote: '使用AI对话功能让我的团队产出内容的速度提升了3倍，客户非常满意我们的交付速度。',
      avatar: '👩‍💼'
    },
    {
      name: '王强',
      role: '自媒体博主',
      quote: 'AI语音合成功能让我可以轻松制作配音视频，不再需要额外花钱请配音演员，性价比太高了！',
      avatar: '👨‍💻'
    },
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-transparent to-nexus-dark/50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          <span className="text-white">用户</span>
          <span className="text-gradient">真实评价</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div 
              key={index}
              className="relative bg-gradient-to-br from-nexus-dark to-nexus-purple/30 p-6 rounded-xl border border-nexus-blue/20 backdrop-blur-sm"
            >
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 text-4xl">
                {item.avatar}
              </div>
              <div className="text-nexus-blue text-4xl font-serif">"</div>
              <p className="text-white/80 mb-4 mt-2 italic">
                {item.quote}
              </p>
              <div className="mt-auto">
                <p className="text-nexus-cyan font-bold">{item.name}</p>
                <p className="text-white/60 text-sm">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
