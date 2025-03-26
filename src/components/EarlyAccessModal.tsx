import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSubscriber } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface EarlyAccessModalProps {
  open: boolean;
  onClose: () => void;
}

const EarlyAccessModal = ({ open, onClose }: EarlyAccessModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await createSubscriber(email);
      toast.success('Thank you for subscribing! We\'ll be in touch soon.');
      onClose();
      setEmail('');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1CD2E8] via-[#965BE4] to-[#201B36]">
            Get Early Access
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Sign up to get early access to our custom AI models and be the first to experience our advanced features.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#3B00EC] to-[#965BE4] hover:from-[#3500D4] hover:to-[#8951CC] text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Subscribing...' : 'Subscribe for Early Access'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EarlyAccessModal; 