import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import supabase from '../lib/supabase';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export interface SignupFormModalProps {
  open: boolean;
  onClose: () => void;
  chatAnswers: Record<string, any>;
}

type FormStage = 'form' | 'success';

const SignupFormModal: React.FC<SignupFormModalProps> = ({ open, onClose, chatAnswers }) => {
  const { user, profile } = useAuth();
  const [formStage, setFormStage] = useState<FormStage>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-fill user data when available
  useEffect(() => {
    if (user && open) {
      let userData = {
        name: '',
        email: user.email || '',
        phone: '',
      };

      if (profile) {
        userData.name = profile.full_name || '';
        userData.phone = profile.phone || '';
      }

      setFormData(userData);

      // If user is logged in and we have all required data, auto-submit the form
      if (userData.email && userData.name) {
        // Very short timeout to ensure the modal has rendered
        setTimeout(() => {
          handleAutoSubmit(userData);
        }, 100);
      }
    }
  }, [user, profile, open]);

  const handleAutoSubmit = async (userData: { name: string; email: string; phone: string }) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const { error } = await supabase
        .from('leads')
        .insert([{
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          answers: chatAnswers
        }]);
      
      if (error) throw error;
      setFormStage('success');
    } catch (error) {
      console.error('Error auto-creating lead:', error);
      setSubmitError('Failed to submit your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-()]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const { error } = await supabase
        .from('leads')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          answers: chatAnswers
        }]);
      
      if (error) throw error;
      setFormStage('success');
    } catch (error) {
      console.error('Error creating lead:', error);
      setSubmitError('Failed to submit your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
    });
    setErrors({});
    setSubmitError(null);
    setFormStage('form');
    onClose();
    
    // Refresh the page if closing from success state
    if (formStage === 'success') {
      window.location.reload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#121212] border border-[#2F2F2F] text-white sm:max-w-[425px]">
        {formStage === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] bg-clip-text text-transparent">
                Get Your Personalized Plan
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-base">
                {user ? 'Confirming your details...' : 'Enter your details to receive your incorporation plan.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`bg-[#1F1F1F] border-[#2F2F2F] text-white placeholder:text-gray-500 h-12 rounded-lg px-6 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`bg-[#1F1F1F] border-[#2F2F2F] text-white placeholder:text-gray-500 h-12 rounded-lg px-6 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`bg-[#1F1F1F] border-[#2F2F2F] text-white placeholder:text-gray-500 h-12 rounded-lg px-6 ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
            </div>

            {submitError && (
              <p className="text-sm text-red-500 text-center">{submitError}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white h-12 rounded-lg font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Get Your Plan'
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-6 py-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-green-100/10 p-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <DialogTitle className="text-2xl font-bold text-white">
                Thank You!
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-base">
                Your personalized incorporation plan will be in your inbox shortly. One of our executives will reach out to you on your provided contact details to discuss the next steps.
              </DialogDescription>
            </div>
            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white h-12 rounded-lg font-medium"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SignupFormModal;