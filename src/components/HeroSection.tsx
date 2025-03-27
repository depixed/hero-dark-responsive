import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useIsMobile } from '../hooks/use-mobile';
import AnimatedBackground from './AnimatedBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const isMobile = useIsMobile();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  
  // Cards data for easy management
  const serviceCards = [
    {
      id: 'incorporation',
      icon: '✓',
      title: 'Incorporation',
      description: 'Register and license your company'
    },
    {
      id: 'accounting',
      icon: '$',
      title: 'Accounting',
      description: 'Manage your bookkeeping'
    },
    {
      id: 'banking',
      icon: '🏦',
      title: 'Bank Account',
      description: 'Open and integrate your bank account'
    },
    {
      id: 'trademark',
      icon: '®',
      title: 'Trademark',
      description: 'Register your trademark'
    },
    {
      id: 'ai',
      icon: 'AI',
      title: 'AI-Based Business Intelligence',
      description: 'Gain advanced insights'
    },
    {
      id: 'tax',
      icon: '🏛️',
      title: 'Corporate Tax',
      description: 'File your taxes'
    }
  ];

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

  // Card animation for stacked cards
  const cardVariants = {
    top: { 
      zIndex: 10, 
      scale: 1, 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    middle1: { 
      zIndex: 9, 
      scale: 0.95, 
      y: 10, 
      opacity: 0.9,
      transition: { duration: 0.5 }
    },
    middle2: { 
      zIndex: 8, 
      scale: 0.9, 
      y: 20, 
      opacity: 0.8,
      transition: { duration: 0.5 }
    },
    bottom: { 
      zIndex: 1, 
      scale: 0.85, 
      y: 30, 
      opacity: 0,
      transition: { duration: 0.5 }
    },
    exit: {
      zIndex: 0,
      scale: 0.8,
      y: -20,
      opacity: 0,
      transition: { duration: 0.5 }
    }
  };

  // Advance to next card in a loop
  useEffect(() => {
    if (isMobile) {
      const interval = setInterval(() => {
        setActiveCardIndex((prev) => (prev + 1) % serviceCards.length);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isMobile]);

  // Get card variant based on position relative to active card
  const getCardVariant = (index) => {
    const diff = (index - activeCardIndex + serviceCards.length) % serviceCards.length;
    
    if (diff === 0) return "top";
    if (diff === 1) return "middle1";
    if (diff === 2) return "middle2";
    return "bottom";
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
                    <span className="text-primary text-xl">{serviceCards[0].icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{serviceCards[0].title}</p>
                    <p className="text-xs text-gray-300">{serviceCards[0].description}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div className="desktop-card transform translate-x-4" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">{serviceCards[1].icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{serviceCards[1].title}</p>
                    <p className="text-xs text-gray-300">{serviceCards[1].description}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div className="desktop-card transform translate-x-12" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">{serviceCards[2].icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{serviceCards[2].title}</p>
                    <p className="text-xs text-gray-300">{serviceCards[2].description}</p>
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
              <motion.div className="flex flex-col items-center space-y-3" variants={itemVariants}>
                <a href="/incorporation" className="w-full max-w-md">
                  <Button className="w-full bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white rounded-lg px-8 py-6 text-base font-medium shadow-lg shadow-purple-500/20">
                    Get Your Personalized Plan
                  </Button>
                </a>
                <a 
                  href="mailto:info@incorpify.ai" 
                  className="mt-2 inline-flex items-center text-white/70 hover:text-white group relative overflow-hidden"
                >
                  <span className="mr-2">Contact us</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/0 group-hover:bg-white/70 transform origin-left transition-all duration-300 scale-x-0 group-hover:scale-x-100"></span>
                </a>
              </motion.div>
            </div>
            
            {/* Right inverted C Arc Cards */}
            <div className="absolute right-0 top-0 h-full flex flex-col justify-between py-16">
              <motion.div className="desktop-card transform -translate-x-12" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">{serviceCards[3].icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{serviceCards[3].title}</p>
                    <p className="text-xs text-gray-300">{serviceCards[3].description}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div className="desktop-card transform -translate-x-4" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">{serviceCards[4].icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{serviceCards[4].title}</p>
                    <p className="text-xs text-gray-300">{serviceCards[4].description}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div className="desktop-card transform -translate-x-12" variants={itemVariants}>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                    <span className="text-primary text-xl">{serviceCards[5].icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{serviceCards[5].title}</p>
                    <p className="text-xs text-gray-300">{serviceCards[5].description}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
        
        {/* Mobile Layout - Stacked Cards with Animation */}
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
            
            {/* Animation in the middle */}
            <motion.div className="w-full max-w-xs mx-auto mb-12" variants={itemVariants}>
              <DotLottieReact
                src="https://lottie.host/f1734a28-94b6-4ac2-b8b0-b905e2fd5cbb/BseX2FThx7.lottie"
                loop
                autoplay
                style={{ width: '150%', height: 'auto', marginLeft: '-25%' }}
              />
            </motion.div>
            
            {/* Stacked Card Animation */}
            <motion.div 
              className="relative h-[120px] mx-auto mb-12 w-[90%] max-w-[320px] stacked-card-container"
              variants={itemVariants}
            >
              <div className="relative w-full h-full">
                {serviceCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    className="mobile-hero-card absolute w-full left-0 top-0"
                    variants={cardVariants}
                    initial="bottom"
                    animate={getCardVariant(index)}
                    exit="exit"
                    custom={index}
                  >
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg">
                        <span className="text-primary text-xl">{card.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{card.title}</p>
                        <p className="text-xs text-gray-300">{card.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* CTA Buttons for Mobile */}
            <motion.div className="flex flex-col space-y-4 px-6 mt-8 mb-12" variants={itemVariants}>
              <a href="/incorporation" className="w-full">
                <Button className="w-full bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white rounded-lg px-8 py-6 text-base font-medium shadow-lg shadow-purple-500/20">
                  Get Your Personalized Plan
                </Button>
              </a>
              <a 
                href="mailto:info@incorpify.ai" 
                className="mt-4 mx-auto inline-flex items-center text-white/70 hover:text-white group relative overflow-hidden"
              >
                <span className="mr-2">Contact us</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/0 group-hover:bg-white/70 transform origin-left transition-all duration-300 scale-x-0 group-hover:scale-x-100"></span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default HeroSection;
