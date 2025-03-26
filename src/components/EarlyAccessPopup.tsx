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
        .insert([{ email, type: 'early_access' }]);
      
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Get Early Access</DialogTitle>
          <DialogDescription className="text-gray-400">
            Sign up to get early access to our custom AI models
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-br from-[#3B00EC] to-[#965BE4] hover:from-[#3500D4] hover:to-[#8951CC] text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe for Early Access'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EarlyAccessPopup; 