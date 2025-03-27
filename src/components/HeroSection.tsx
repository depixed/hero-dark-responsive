import React from 'react';
import { Button } from './ui/button';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useIsMobile } from '../hooks/use-mobile';
import AnimatedBackground from './AnimatedBackground';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const isMobile = useIsMobile();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="w-full pt-24 pb-16 overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground intensity="medium" />
      
      <motion.div 
        className="max-w-7xl mx-auto px-4 relative"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Desktop Layout - Cards positioned in C arcs with content in middle */}
        {!isMobile && (
          <div className="relative z-10 min-h-[700px]">
            {/* Left C Arc Cards */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-16">
              <motion.div className="desktop-card" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Incorporation</p>
                    <p className="text-xs text-gray-300">Register and license your company</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div className="desktop-card transform translate-x-4" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">$</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Accounting</p>
                    <p className="text-xs text-gray-300">Manage your bookkeeping</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div className="desktop-card transform translate-x-12" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">🏦</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Bank Account</p>
                    <p className="text-xs text-gray-300">Open and integrate your bank account</p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Center Content */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 w-full max-w-3xl mx-auto flex flex-col items-center z-20 pt-8 pb-12">
              {/* Hero Text Content */}
              <motion.div className="text-center z-10 relative mb-8 px-4 pt-[100px]" variants={itemVariants}>
                {/* Coming Soon Text */}
                <motion.h2 
                  className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-[#8e53e5] to-white text-transparent bg-clip-text tracking-tight"
                  variants={itemVariants}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  COMING SOON
                </motion.h2>

                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-white">
                  The one-stop-shop that allows business <br className="hidden md:block" /> 
                  owners to focus on what matters most:
                  <br />
                  <span className="text-[#a675f0]">Business</span>
                </h1>
                
                <p className="text-sm md:text-base text-gray-300 mb-2">
                  Powered by Machine Learning and Advanced AI
                </p>
              </motion.div>
              
              {/* Animation */}
              <motion.div className="w-full max-w-md mx-auto mb-8" variants={itemVariants}>
                <DotLottieReact
                  src="https://lottie.host/f1734a28-94b6-4ac2-b8b0-b905e2fd5cbb/BseX2FThx7.lottie"
                  loop
                  autoplay
                  style={{ width: '100%', height: 'auto' }}
                />
              </motion.div>
              
              {/* CTA Buttons */}
              <motion.div className="flex justify-center space-x-4" variants={itemVariants}>
                <a href="/incorporation">
                  <Button className="bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white rounded-lg px-8 py-6 text-base font-medium shadow-lg shadow-purple-500/20">
                    Get Your Personalized Plan
                  </Button>
                </a>
                <a href="/signup" className="hidden md:block">
                  <Button className="border-2 border-[#8e53e5] hover:bg-[#8e53e5]/10 text-white rounded-lg px-8 py-6 text-base transition-colors duration-200">
                    Sign Up / Sign In
                  </Button>
                </a>
                <a href="mailto:info@incorpify.ai">
                  <Button className="bg-transparent border-2 border-[#8e53e5] hover:bg-[#8e53e5]/10 text-white rounded-lg px-8 py-6 text-base transition-colors duration-200">
                    Get in touch
                  </Button>
                </a>
              </motion.div>
            </div>
            
            {/* Right inverted C Arc Cards */}
            <div className="absolute right-0 top-0 h-full flex flex-col justify-between py-16">
              <motion.div className="desktop-card transform -translate-x-12" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">®</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Trademark</p>
                    <p className="text-xs text-gray-300">Register your trademark</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div className="desktop-card transform -translate-x-4" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">AI</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">AI-Based Business Intelligence</p>
                    <p className="text-xs text-gray-300">Gain advanced insights</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div className="desktop-card transform -translate-x-12" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">🏛️</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Corporate Tax</p>
                    <p className="text-xs text-gray-300">File your taxes</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
        
        {/* Mobile Layout - Stacked vertically */}
        {isMobile && (
          <motion.div 
            className="relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Hero Content */}
            <motion.div className="text-center z-10 relative max-w-3xl mx-auto mb-8 pt-24" variants={itemVariants}>
              {/* Coming Soon Text */}
              <motion.h2 
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 bg-gradient-to-r from-[#8e53e5] to-white text-transparent bg-clip-text tracking-tight"
                variants={itemVariants}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                COMING SOON
              </motion.h2>
              
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 text-white">
                The one-stop-shop that allows<br /> 
                business owners to focus on what matters most:
                <br />
                <span className="text-[#a675f0]">Business</span>
              </h1>
              
              <p className="text-sm md:text-base text-gray-300 mb-4">
                Powered by Machine Learning and Advanced AI
              </p>
            </motion.div>
            
            {/* Animation in the middle (2X size) */}
            <motion.div className="w-full max-w-xs mx-auto mb-12" variants={itemVariants}>
              <DotLottieReact
                src="https://lottie.host/f1734a28-94b6-4ac2-b8b0-b905e2fd5cbb/BseX2FThx7.lottie"
                loop
                autoplay
                style={{ width: '150%', height: 'auto', marginLeft: '-25%' }}
              />
            </motion.div>
            
            {/* Cards stacked vertically */}
            <div className="grid grid-cols-1 gap-4 mb-12 px-4">
              <motion.div className="mobile-hero-card" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Incorporation</p>
                    <p className="text-xs text-gray-300">Register and license your company</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div className="mobile-hero-card" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">$</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Accounting</p>
                    <p className="text-xs text-gray-300">Manage your bookkeeping</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div className="mobile-hero-card" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">🏦</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Bank Account</p>
                    <p className="text-xs text-gray-300">Open and integrate your bank account</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div className="mobile-hero-card" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">®</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Trademark</p>
                    <p className="text-xs text-gray-300">Register your trademark</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div className="mobile-hero-card" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">AI</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">AI-Based Business Intelligence</p>
                    <p className="text-xs text-gray-300">Gain advanced insights</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div className="mobile-hero-card" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">🏛️</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Corporate Tax</p>
                    <p className="text-xs text-gray-300">File your taxes</p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* CTA Buttons for Mobile */}
            <motion.div className="flex flex-col space-y-4 px-6 mt-8 mb-12" variants={itemVariants}>
              <a href="/incorporation" className="w-full">
                <Button className="w-full bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white rounded-lg px-8 py-6 text-base font-medium shadow-lg shadow-purple-500/20">
                  Get Your Personalized Plan
                </Button>
              </a>
              <a href="/signup" className="w-full">
                <Button className="w-full border-2 border-[#8e53e5] hover:bg-[#8e53e5]/10 text-white rounded-lg px-8 py-6 text-base transition-colors duration-200">
                  Sign Up / Sign In
                </Button>
              </a>
              <a href="mailto:info@incorpify.ai" className="w-full">
                <Button className="w-full bg-transparent border-2 border-[#8e53e5] hover:bg-[#8e53e5]/10 text-white rounded-lg px-8 py-6 text-base transition-colors duration-200">
                  Get in touch
                </Button>
              </a>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default HeroSection;
