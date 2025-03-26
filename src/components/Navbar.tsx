import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll event listener to change navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 w-full py-4 px-4 md:px-8 flex justify-center items-center z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/50 backdrop-blur-md' : 'bg-transparent'
    }`}>
      <div className="flex items-center justify-center w-full max-w-7xl">
        <Link to="/">
          <motion.img 
            src="/incorpify-logo.png" 
            alt="Incorpify Logo" 
            className="h-16 md:h-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
