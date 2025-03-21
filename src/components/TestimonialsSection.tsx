import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
interface Testimonial {
  id: number;
  quote: string;
  author: string;
  position: string;
}
const testimonials: Testimonial[] = [{
  id: 1,
  quote: "I recently used [Startup Name] for my business incorporation and was impressed by their efficiency and professionalism. The process was straightforward, the team was knowledgeable, and the online platform was easy to use. I highly recommend Incorpify for a seamless incorporation experience.",
  author: "Laura Ahmed",
  position: "CEO, Layers"
}, {
  id: 2,
  quote: "The team at Incorpify made our company formation process incredibly simple. Their attention to detail and responsive support team exceeded our expectations.",
  author: "Michael Chen",
  position: "Founder, TechSolutions"
}, {
  id: 3,
  quote: "Starting our business was daunting until we found Incorpify. Their all-in-one platform saved us countless hours and helped navigate complex legal requirements with ease.",
  author: "Sarah Johnson",
  position: "Co-founder, CreativeMinds"
}];
const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const nextTestimonial = () => {
    setActiveIndex(prev => (prev + 1) % testimonials.length);
  };
  const prevTestimonial = () => {
    setActiveIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };
  return;
};
export default TestimonialsSection;