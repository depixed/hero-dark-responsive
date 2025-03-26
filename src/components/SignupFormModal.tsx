import React, { useState } from 'react';
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
import { sendOTP, verifyOTP, createLead } from '../lib/supabase';
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmailForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await sendOTP(formData.email);
      setFormStage('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setSubmitError('Failed to send verification code. Please try again.');
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
      const isValid = await verifyOTP(formData.email, otp);
      
      if (isValid) {
        // Submit the full form data to the database
        await createLead({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          answers: chatAnswers
        });
        
        setFormStage('success');
      } else {
        setErrors({ otp: 'Invalid verification code. Please try again.' });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setSubmitError('Failed to verify code. Please try again.');
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
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1CD2E8] via-[#965BE4] to-[#201B36]">
                Get Your Personalized Plan
              </DialogTitle>
              <DialogDescription className="text-gray-400">
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
                  className={`bg-gray-900 border-gray-700 text-white ${errors.name ? 'border-red-500' : ''}`}
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
                  className={`bg-gray-900 border-gray-700 text-white ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`bg-gray-900 border-gray-700 text-white ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
            </div>

            {submitError && (
              <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 rounded-md text-sm">
                {submitError}
              </div>
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#1CD2E8] via-[#965BE4] to-[#201B36] hover:opacity-90 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Verify Email
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        );

      case 'otp':
        return (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Verify Your Email
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                We've sent a 6-digit code to <span className="text-blue-400">{formData.email}</span>.
                Enter it below to verify your email.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-white">Verification Code</Label>
                <div className="flex items-center bg-gray-900 border border-gray-700 rounded-md focus-within:ring-1 focus-within:ring-purple-500 focus-within:border-purple-500">
                  <span className="pl-3 pr-2 text-gray-400">
                    <Mail className="h-5 w-5" />
                  </span>
                  <Input
                    id="otp"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                      if (errors.otp) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.otp;
                          return newErrors;
                        });
                      }
                    }}
                    className={`bg-transparent border-0 focus-visible:ring-0 text-white text-lg letter-spacing-1 ${errors.otp ? 'border-red-500' : ''}`}
                    maxLength={6}
                    placeholder="123456"
                  />
                </div>
                {errors.otp && <p className="text-sm text-red-500">{errors.otp}</p>}
                <p className="text-xs text-gray-400 mt-2">
                  For this demo, the OTP is always <span className="font-semibold">123456</span>
                </p>
              </div>
            </div>

            {submitError && (
              <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 rounded-md text-sm">
                {submitError}
              </div>
            )}

            <DialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormStage('form')}
                className="text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#1CD2E8] via-[#965BE4] to-[#201B36] hover:opacity-90 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Complete Sign Up
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        );

      case 'success':
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500/20 p-3">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-gray-400">
                Your incorporation plan is on its way to your email.
                One of our specialists will contact you soon.
              </p>
            </div>
            
            <Button
              type="button"
              onClick={handleClose}
              className="bg-gradient-to-r from-[#1CD2E8] via-[#965BE4] to-[#201B36] hover:opacity-90 text-white"
            >
              Close
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-950 border-gray-800 text-white sm:max-w-[425px]">
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
};

export default SignupFormModal; 