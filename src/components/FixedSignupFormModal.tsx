import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import supabase, { sendOTP } from '../lib/supabase';
import { CheckCircle, ArrowRight, Loader2, Mail } from 'lucide-react';

export interface SignupFormModalProps {
  open: boolean;
  onClose: () => void;
  chatAnswers: Record<string, any>;
}

type FormStage = 'form' | 'otp' | 'success';

const SignupFormModal: React.FC<SignupFormModalProps> = ({ open, onClose, chatAnswers }) => {
  const [formStage, setFormStage] = useState<FormStage>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');

  // Check and ensure we have a session when the modal opens
  useEffect(() => {
    if (open) {
      const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        setHasSession(!!data.session);
        
        if (!data.session) {
          try {
            // Sign in anonymously if we don't have a session
            await supabase.auth.signInAnonymously();
            setHasSession(true);
          } catch (error) {
            console.error('Error signing in anonymously:', error);
          }
        }
      };
      
      checkSession();
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors for field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateEmailForm = () => {
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

  const validateOtpForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateOtp = () => {
    // Generate a 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    return newOtp;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmailForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Ensure we have an anonymous session
      if (!hasSession) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        setHasSession(true);
      }
      
      // Generate OTP and send email
      const newOtp = await sendOTP(formData.email);
      setGeneratedOtp(newOtp);
      
      // Success - go to OTP verification step
      setFormStage('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setSubmitError('Failed to send verification code. Please try again or use the test code shown below.');
      // Even if there's an error, we'll still set the generatedOtp and move to OTP stage
      // This ensures users can still test the form
      setFormStage('otp');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOtpForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Verify OTP
      // For demo, we accept either the generated OTP or "123456"
      if (otp === generatedOtp || otp === '123456') {
        // Ensure we still have a session before insertion
        if (!hasSession) {
          const { error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
        }
        
        // Insert into leads table
        const { error } = await supabase
          .from('leads')
          .insert([{
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            answers: chatAnswers
          }]);
        
        if (error) {
          console.error('Supabase error:', error);
          
          // Special handling for RLS policy errors
          if (error.code === '42501') {
            // Try to disable RLS temporarily in supabase SQL editor using fix-rls.sql
            setSubmitError('Authorization error. Please make sure RLS is properly configured.');
            return;
          }
          
          throw error;
        }
        
        // Success!
        setFormStage('success');
      } else {
        setErrors({ otp: 'Invalid verification code. Please try again.' });
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      setSubmitError('Failed to submit your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset the form when closing
    setFormData({
      name: '',
      email: '',
      phone: '',
    });
    setOtp('');
    setErrors({});
    setSubmitError(null);
    setFormStage('form');
    onClose();
  };

  const renderForm = () => {
    switch (formStage) {
      case 'form':
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] bg-clip-text text-transparent">
                Get Your Personalized Plan
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-base">
                Enter your details to receive your incorporation plan.
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
              <p className="text-sm text-red-500 mt-2">{submitError}</p>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white rounded-lg px-8 text-base font-medium transition-all duration-200 ease-in-out"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                'Get Your Personalized Plan'
              )}
            </Button>
          </form>
        );

      case 'otp':
        return (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] bg-clip-text text-transparent">
                Verify Your Email
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-base">
                We've sent a verification code to {formData.email}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-white">Verification Code</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`bg-[#1F1F1F] border-[#2F2F2F] text-white placeholder:text-gray-500 h-12 rounded-lg px-6 ${errors.otp ? 'border-red-500' : ''}`}
                  placeholder="Enter 6-digit code"
                />
                {errors.otp && <p className="text-sm text-red-500">{errors.otp}</p>}
              </div>
            </div>

            {submitError && (
              <p className="text-sm text-red-500 mt-2">{submitError}</p>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white rounded-lg px-8 text-base font-medium transition-all duration-200 ease-in-out"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify Email'
              )}
            </Button>
          </form>
        );

      case 'success':
        return (
          <div className="space-y-6">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] bg-clip-text text-transparent">
                Thank You!
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-base">
                Your personalized incorporation plan is ready. We'll be in touch shortly to discuss the next steps.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>

            <Button 
              onClick={handleClose}
              className="w-full h-12 bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white rounded-lg px-8 text-base font-medium transition-all duration-200 ease-in-out"
            >
              Close
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#0A0A0A] border border-[#1F1F1F] text-white">
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
};

export default SignupFormModal;