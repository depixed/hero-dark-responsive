import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
// Import other components but don't use them until they're implemented
// import ServicesSection from '../components/ServicesSection';
// import StatsSection from '../components/StatsSection';
// import TestimonialsSection from '../components/TestimonialsSection';
// import FeaturedSection from '../components/FeaturedSection';
// import CTASection from '../components/CTASection';
// import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col">
      <Navbar />
      <HeroSection />
      {/* Only include fully implemented sections
      <ServicesSection />
      <StatsSection />
      <TestimonialsSection />
      <FeaturedSection />
      <CTASection />
      <Footer /> 
      */}
    </div>
  );
};

export default Index;
