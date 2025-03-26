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
import { signInWithOtp } from '../lib/supabase';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import supabase from '../lib/supabase';

export interface SignupFormModalProps {
  open: boolean;
  onClose: () => void;
  chatAnswers: Record<string, any>;
}

type FormStage = 'form' | 'verifying' | 'success';

const SimpleSignupFormModal: React.FC<SignupFormModalProps> = ({ open, onClose, chatAnswers }) => {
  const [formStage, setFormStage] = useState<FormStage>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
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
      // Send OTP to user's email
      await signInWithOtp(formData.email);
      
      // Store form data in localStorage for after verification
      localStorage.setItem('pendingSignupData', JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        answers: chatAnswers
      }));
      
      setFormStage('verifying');
    } catch (error) {
      console.error('Error sending verification email:', error);
      setSubmitError('Failed to send verification email. Please try again.');
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
    setErrors({});
    setSubmitError(null);
    setFormStage('form');
    onClose();
  };

  const renderForm = () => {
    switch (formStage) {
      case 'form':
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>

            {submitError && (
              <p className="text-sm text-red-500 text-center">{submitError}</p>
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-br from-[#3B00EC] to-[#965BE4] hover:from-[#3500D4] hover:to-[#8951CC]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        );

      case 'verifying':
        return (
          <div className="space-y-6 text-center">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1CD2E8] via-[#965BE4] to-[#201B36]">
                Check Your Email
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                We've sent a verification link to {formData.email}. Please check your email and click the link to verify your email address.
              </DialogDescription>
            </DialogHeader>
            <div className="animate-pulse">
              <Loader2 className="mx-auto h-8 w-8 text-purple-500 animate-spin" />
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6 text-center">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1CD2E8] via-[#965BE4] to-[#201B36]">
                Thank You!
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Thank you for signing up! Someone from our team will contact you shortly with more details about your incorporation plan.
              </DialogDescription>
            </DialogHeader>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        );
    }
  };

  // Listen for auth state changes to detect when email is verified
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        // Get the stored form data
        const storedData = localStorage.getItem('pendingSignupData');
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            
            // Create the lead in the database
            await supabase
              .from('leads')
              .insert([{
                name: parsedData.name,
                email: parsedData.email,
                phone: parsedData.phone,
                answers: parsedData.answers,
                status: 'new'
              }]);
            
            // Clear stored data
            localStorage.removeItem('pendingSignupData');
            
            // Show success message
            setFormStage('success');
          } catch (error) {
            console.error('Error creating lead after verification:', error);
            setSubmitError('An error occurred while saving your information. Please try again.');
            setFormStage('form');
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
};

export default SimpleSignupFormModal; 