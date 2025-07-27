
import React from 'react';
import HeroSection from '@/components/HeroSection';
import AIDemo from '@/components/AIDemo';
import ImageShowcase from '@/components/ImageShowcase';
import TestimonialsSection from '@/components/TestimonialsSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-nexus-dark relative">
      <HeroSection />
      <AIDemo />
      <ImageShowcase />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
