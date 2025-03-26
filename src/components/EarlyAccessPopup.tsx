import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface EarlyAccessPopupProps {
  open: boolean;
  onClose: () => void;
}

const EarlyAccessPopup: React.FC<EarlyAccessPopupProps> = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert the subscription into the subscribers table
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email }]);
      
      if (error) {
        if (error.code === '23505') { // Unique violation error code
          toast.error('This email is already subscribed');
        } else {
          console.error('Error submitting email:', error);
          toast.error('Failed to subscribe. Please try again later.');
        }
      } else {
        toast.success('Thanks for subscribing to early access!');
        setEmail('');
        onClose();
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0A0A0A] border border-[#1F1F1F] text-white">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] bg-clip-text text-transparent">
            Sign up for early access
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-base">
            Be among the first to experience our custom AI models. Join our early access program today.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#1F1F1F] border-[#2F2F2F] text-white placeholder:text-gray-500 h-12 rounded-lg px-6"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white rounded-lg px-8 text-base font-medium transition-all duration-200 ease-in-out"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin" />
                <span>Subscribing...</span>
              </div>
            ) : (
              'Sign up'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EarlyAccessPopup; 