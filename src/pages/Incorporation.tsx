import React from 'react';
import Navbar from '../components/Navbar';
import IncorporationChat from '../components/IncorporationChat';
import AnimatedBackground from '../components/AnimatedBackground';

const Incorporation = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col">
      <Navbar />
      <AnimatedBackground intensity="medium" />
      <IncorporationChat />
    </div>
  );
};

export default Incorporation; 