import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { useIsMobile } from '../hooks/use-mobile';
import SignupFormModal from './FixedSignupFormModal';
import EarlyAccessModal from './EarlyAccessModal';
import {
  Building2, 
  CirclePlus, 
  Leaf, 
  Shirt, 
  Building as Bank, 
  BrainCircuit, 
  FlaskConical as Flask, 
  Atom, 
  Radio, 
  Video, 
  HelpCircle, 
  Share2, 
  BadgeDollarSign, 
  ArrowRightLeft, 
  Globe, 
  FileText as Passport, 
  Landmark, 
  User, 
  Users, 
  UserPlus, 
  Building, 
  Laptop as LaptopCode, 
  HelpCircle as CircleQuestion, 
  DollarSign, 
  CreditCard, 
  Briefcase, 
  BookCheck, 
  Shield, 
  HeartPulse, 
  CheckCircle2, 
  PlusCircle, 
  Send
} from 'lucide-react';

// Interface definitions
export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  subtext?: string;
  options: QuestionOption[];
  multiSelect?: boolean;
}

// Questions array
export const questions: Question[] = [
  {
    id: 'company_status',
    text: 'Do you have an existing company in the UAE?',
    options: [
      { id: 'new', text: 'No, I want to set up a new company' },
      { id: 'existing', text: 'Yes, I have an existing company' }
    ]
  },
  {
    id: 'business_activity',
    text: 'What is your planned business activity?',
    subtext: 'Choose one that best describes your business',
    options: [
      { id: 'agriculture', text: 'Agriculture' },
      { id: 'apparel', text: 'Apparel' },
      { id: 'banking', text: 'Banking' },
      { id: 'consulting', text: 'Consulting' },
      { id: 'biotechnology', text: 'Biotechnology' },
      { id: 'chemicals', text: 'Chemicals' },
      { id: 'communication', text: 'Communication' },
      { id: 'media', text: 'Media' },
      { id: 'other', text: 'Other' }
    ]
  },
  {
    id: 'setup_reason',
    text: 'What is the main reason you\'re setting up a company in the UAE?',
    subtext: 'Select one',
    options: [
      { id: 'foreign_ownership', text: '100% foreign ownership' },
      { id: 'tax_optimization', text: 'Tax optimization' },
      { id: 'uae_market', text: 'Access to UAE market' },
      { id: 'gcc_market', text: 'Access to GCC market' },
      { id: 'residency_visa', text: 'Residency visa' },
      { id: 'investor_friendly', text: 'Investor-friendly regulations' },
      { id: 'other', text: 'Other' }
    ]
  },
  {
    id: 'shareholders_count',
    text: 'How many shareholders will your company have?',
    options: [
      { id: '1', text: '1' },
      { id: '2-5', text: '2-5' },
      { id: 'more_than_5', text: 'More than 5' }
    ]
  },
  {
    id: 'shareholder_nationalities',
    text: 'What are the nationalities of the shareholders?',
    options: [
      { id: 'uae', text: 'UAE National' },
      { id: 'gcc', text: 'GCC National' },
      { id: 'non_gcc', text: 'Non-GCC National' },
      { id: 'mixed', text: 'Mixed' }
    ]
  },
  {
    id: 'physical_office',
    text: 'Will your business require a physical office space?',
    options: [
      { id: 'yes', text: 'Yes' },
      { id: 'no', text: 'No' },
      { id: 'not_sure', text: 'Not sure yet' }
    ]
  },
  {
    id: 'initial_capital',
    text: 'What is your estimated initial capital investment?',
    options: [
      { id: 'below_50k', text: 'Below AED 50,000' },
      { id: '50k_150k', text: 'AED 50,000 - 150,000' },
      { id: 'above_150k', text: 'Above AED 150,000' },
      { id: 'no_answer', text: 'Prefer not to say' }
    ]
  },
  {
    id: 'additional_services',
    text: 'Would you like assistance with any of the following?',
    subtext: 'Select all that apply',
    multiSelect: true,
    options: [
      { id: 'bank_account', text: 'Opening a business bank account' },
      { id: 'visa_residency', text: 'Visa & Residency setup' },
      { id: 'accounting_tax', text: 'Accounting & Tax registration' },
      { id: 'insurance', text: 'Insurance setup' },
      { id: 'medical', text: 'Medical appointment' },
      { id: 'all', text: 'All of the above' }
    ]
  }
];

// Helper function to get appropriate icon for answer options
const getOptionIcon = (questionId: string, optionId: string) => {
  // Company status icons
  if (questionId === 'company_status') {
    if (optionId === 'existing') {
      return <Building2 className="w-5 h-5 mr-2" />;
    } else if (optionId === 'new') {
      return <CirclePlus className="w-5 h-5 mr-2" />;
    }
  }
  
  // Business activity icons
  if (questionId === 'business_activity') {
    switch (optionId) {
      case 'agriculture':
        return <Leaf className="w-5 h-5 mr-2" />;
      case 'apparel':
        return <Shirt className="w-5 h-5 mr-2" />;
      case 'banking':
        return <Bank className="w-5 h-5 mr-2" />;
      case 'consulting':
        return <BrainCircuit className="w-5 h-5 mr-2" />;
      case 'biotechnology':
        return <Flask className="w-5 h-5 mr-2" />;
      case 'chemicals':
        return <Atom className="w-5 h-5 mr-2" />;
      case 'communication':
        return <Radio className="w-5 h-5 mr-2" />;
      case 'media':
        return <Video className="w-5 h-5 mr-2" />;
      default:
        return <HelpCircle className="w-5 h-5 mr-2" />;
    }
  }
  
  // Setup reason icons
  if (questionId === 'setup_reason') {
    switch (optionId) {
      case 'foreign_ownership':
        return <Share2 className="w-5 h-5 mr-2" />;
      case 'tax_optimization':
        return <BadgeDollarSign className="w-5 h-5 mr-2" />;
      case 'uae_market':
      case 'gcc_market':
        return <Globe className="w-5 h-5 mr-2" />;
      case 'residency_visa':
        return <Passport className="w-5 h-5 mr-2" />;
      case 'investor_friendly':
        return <Landmark className="w-5 h-5 mr-2" />;
      default:
        return <HelpCircle className="w-5 h-5 mr-2" />;
    }
  }
  
  // Shareholders count icons
  if (questionId === 'shareholders_count') {
    switch (optionId) {
      case '1':
        return <User className="w-5 h-5 mr-2" />;
      case '2-5':
        return <Users className="w-5 h-5 mr-2" />;
      case 'more_than_5':
        return <UserPlus className="w-5 h-5 mr-2" />;
      default:
        return <HelpCircle className="w-5 h-5 mr-2" />;
    }
  }
  
  // Physical office icons
  if (questionId === 'physical_office') {
    switch (optionId) {
      case 'yes':
        return <Building className="w-5 h-5 mr-2" />;
      case 'no':
        return <LaptopCode className="w-5 h-5 mr-2" />;
      case 'not_sure':
        return <CircleQuestion className="w-5 h-5 mr-2" />;
      default:
        return <HelpCircle className="w-5 h-5 mr-2" />;
    }
  }
  
  // Initial capital icons
  if (questionId === 'initial_capital') {
    switch (optionId) {
      case 'below_50k':
        return <DollarSign className="w-5 h-5 mr-2" />;
      case '50k_150k':
        return <BadgeDollarSign className="w-5 h-5 mr-2" />;
      case 'above_150k':
        return <CreditCard className="w-5 h-5 mr-2" />;
      default:
        return <HelpCircle className="w-5 h-5 mr-2" />;
    }
  }
  
  // Additional services icons
  if (questionId === 'additional_services') {
    switch (optionId) {
      case 'bank_account':
        return <Bank className="w-5 h-5 mr-2" />;
      case 'visa_residency':
        return <Passport className="w-5 h-5 mr-2" />;
      case 'accounting_tax':
        return <Briefcase className="w-5 h-5 mr-2" />;
      case 'insurance':
        return <Shield className="w-5 h-5 mr-2" />;
      case 'medical':
        return <HeartPulse className="w-5 h-5 mr-2" />;
      case 'all':
        return <CheckCircle2 className="w-5 h-5 mr-2" />;
      default:
        return <HelpCircle className="w-5 h-5 mr-2" />;
    }
  }
  
  // Shareholder nationalities icons
  if (questionId === 'shareholder_nationalities') {
    switch (optionId) {
      case 'uae':
      case 'gcc':
      case 'non_gcc':
        return <Globe className="w-5 h-5 mr-2" />;
      case 'mixed':
        return <Users className="w-5 h-5 mr-2" />;
      default:
        return <HelpCircle className="w-5 h-5 mr-2" />;
    }
  }
  
  // Default icon for other cases
  return <HelpCircle className="w-5 h-5 mr-2" />;
};

// Typing effect component
const TypedText = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [completed, setCompleted] = useState(false);
  const index = useRef(0);

  useEffect(() => {
    if (completed) return;

    if (displayedText.length === text.length) {
      setCompleted(true);
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText(text.substring(0, index.current + 1));
      index.current += 1;
    }, 15); // Speed of typing

    return () => clearTimeout(timer);
  }, [displayedText, text, completed, onComplete]);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCompleted(false);
    index.current = 0;
  }, [text]);

  return <>{displayedText}</>;
};

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-purple-500 animate-spin"></div>
  </div>
);

const IncorporationChat = () => {
  const isMobile = useIsMobile();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>({});
  const [chatHistory, setChatHistory] = useState<Array<{type: 'question' | 'answer', content: any}>>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [showEarlyAccessModal, setShowEarlyAccessModal] = useState(false);

  // Function to add delay with loading animation
  const addNextQuestionWithDelay = (nextQuestion: Question | { text: string; subtext?: string }) => {
    setTypingComplete(false);
    setShowOptions(false);
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setChatHistory(prev => [
        ...prev,
        { type: 'question', content: nextQuestion }
      ]);
    }, 800); // 800ms delay with loading animation
  };

  // Handle selecting an answer
  const handleSelectAnswer = (questionId: string, optionId: string) => {
    // If we're on the first question and user selects "existing company"
    if (questionId === 'company_status' && optionId === 'existing') {
      // Skip to the end or to a different flow
      setIsComplete(true);
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: optionId
      }));
      
      // Add answer to chat history
      const option = questions[currentStep].options.find(opt => opt.id === optionId);
      if (!option) return;
      
      setChatHistory(prev => [
        ...prev, 
        { type: 'answer', content: option.text }
      ]);
      
      // Add loading animation and delay
      addNextQuestionWithDelay({ 
        text: "Great! We'll help you switch to incorpify. Please leave your contact details and we'll be in touch soon."
      });
      
      return;
    }

    // For multi-select questions
    if (questions[currentStep].multiSelect) {
      const currentAnswers = selectedAnswers[questionId] as string[] || [];
      
      // If "All of the above" is selected, clear other selections
      if (optionId === 'all') {
        setSelectedAnswers(prev => ({
          ...prev,
          [questionId]: ['all']
        }));
        return;
      }
      
      // If another option is selected when "All of the above" was previously selected,
      // remove "All of the above"
      let newAnswers = [...currentAnswers];
      if (currentAnswers.includes('all') && optionId !== 'all') {
        newAnswers = newAnswers.filter(id => id !== 'all');
      }
      
      // Toggle selection
      if (newAnswers.includes(optionId)) {
        newAnswers = newAnswers.filter(id => id !== optionId);
      } else {
        newAnswers.push(optionId);
      }
      
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: newAnswers
      }));
      return;
    }
    
    // For single-select questions
    const option = questions[currentStep].options.find(opt => opt.id === optionId);
    if (!option) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));

    // Add answer to chat history
    setChatHistory(prev => [
      ...prev,
      { type: 'answer', content: option.text }
    ]);

    // Move to next question or complete
    if (currentStep < questions.length - 1) {
      const nextQuestion = questions[currentStep + 1];
      
      // Add next question with delay and loading animation
      addNextQuestionWithDelay(nextQuestion);
      
      setCurrentStep(currentStep + 1);
    } else {
      // Complete the flow
      setIsComplete(true);
      
      // Add loading animation and completion message
      addNextQuestionWithDelay({ 
        text: "Great! We're ready to create your personalized incorporation plan."
      });
    }
  };

  // Submit multi-select answers
  const handleSubmitMultiSelect = () => {
    const currentQuestion = questions[currentStep];
    if (!currentQuestion.multiSelect) return;
    
    const selectedOptions = selectedAnswers[currentQuestion.id] as string[] || [];
    if (selectedOptions.length === 0) return;
    
    // Add answer to chat history (display selected option texts, not ids)
    const selectedTexts = selectedOptions.map(optionId => 
      currentQuestion.options.find(opt => opt.id === optionId)?.text || ''
    );
    
    setChatHistory(prev => [
      ...prev,
      { type: 'answer', content: selectedTexts.join(', ') }
    ]);

    // Complete the flow
    setIsComplete(true);
    
    // Add loading animation and completion message
    addNextQuestionWithDelay({ 
      text: "Great! We're ready to create your personalized incorporation plan."
    });
  };

  // Handle opening signup modal
  const handleOpenSignupModal = () => {
    setIsSignupModalOpen(true);
  };

  // Handle closing signup modal
  const handleCloseSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle send message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    setShowEarlyAccessModal(true);
  };

  // Handle typing complete for showing options
  const handleTypingComplete = () => {
    setTypingComplete(true);
    setTimeout(() => {
      setShowOptions(true);
    }, 300);
  };

  // Initialize the chat with the first question
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([
        { 
          type: 'question', 
          content: {
            text: "Hi there, What would you like to know?",
            subtext: "Let us handle the complexities, so you can focus on your business."
          }
        }
      ]);
      
      // Add first question with delay
      setTimeout(() => {
        setChatHistory(prev => [
          ...prev,
          { type: 'question', content: questions[0] }
        ]);
      }, 800);
    }
  }, []);

  // Scroll to bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, showOptions]);

  // Reset typing and options state when current step changes
  useEffect(() => {
    setTypingComplete(false);
    setShowOptions(false);
  }, [currentStep]);

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const optionsVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.4,
        staggerChildren: 0.05 
      } 
    }
  };

  const optionVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  // Find the index of the current question in chatHistory
  const getQuestionNumber = (questionId: string) => {
    return questions.findIndex(q => q.id === questionId) + 1;
  };

  return (
    <div className="flex flex-col h-screen pt-[80px] relative z-10">
      {/* Scrollable chat content */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto pb-[90px] px-4"
      >
        <motion.div 
          className="max-w-[904px] mx-auto"
          initial="hidden"
          animate="show"
          variants={containerVariants}
        >
          <AnimatePresence>
            {chatHistory.map((item, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className={`mb-6 ${item.type === 'answer' ? 'flex justify-end' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {item.type === 'question' && (
                  <div className={`max-w-[80%] ${index === 0 ? 'mx-auto text-center pt-10' : ''}`}>
                    {index === 0 ? (
                      // First welcome message
                      <div className="space-y-5">
                        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1CD2E8] via-[#965BE4] to-[#201B36]">
                          {item.content.text}
                        </h1>
                        {item.content.subtext && (
                          <p className="text-base text-gray-300">
                            {item.content.subtext}
                          </p>
                        )}
                      </div>
                    ) : (
                      // Regular question
                      <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-5 shadow-md text-white">
                        {index > 1 && !isComplete && item.content.id && (
                          <div className="flex items-center text-blue-400 mb-2 text-sm">
                            {getOptionIcon(item.content.id, item.content.options[0].id)}
                            <span>{`${getQuestionNumber(item.content.id)} of ${questions.length} questions`}</span>
                          </div>
                        )}
                        <h2 className="text-lg font-bold">
                          {index === chatHistory.length - 1 && item.content.text ? (
                            <TypedText 
                              text={item.content.text} 
                              onComplete={handleTypingComplete}
                            />
                          ) : (
                            item.content.text
                          )}
                        </h2>
                        {item.content.subtext && (
                          <p className="text-sm text-gray-300 mt-1">
                            {item.content.subtext}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {item.type === 'answer' && (
                  <div className="bg-purple-900/30 border border-purple-700/50 text-purple-100 p-3 rounded-xl shadow-sm">
                    {item.content}
                  </div>
                )}
              </motion.div>
            ))}
            
            {/* Loading animation */}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6"
              >
                <LoadingSpinner />
              </motion.div>
            )}
            
            {/* Current question options if not complete */}
            {!isComplete && questions[currentStep] && showOptions && typingComplete && (
              <motion.div 
                variants={optionsVariants}
                initial="hidden"
                animate="show" 
                className="mb-8"
                key="current-options"
              >
                <div className="flex flex-wrap gap-3">
                  {questions[currentStep].options.map((option) => {
                    const isSelected = questions[currentStep].multiSelect
                      ? (selectedAnswers[questions[currentStep].id] as string[] || []).includes(option.id)
                      : selectedAnswers[questions[currentStep].id] === option.id;
                    
                    return (
                      <motion.div
                        key={option.id}
                        variants={optionVariants}
                        className={`p-3 border rounded-xl cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-900/30 text-purple-100' 
                            : 'border-gray-700 bg-gray-800/70 text-gray-100 hover:border-purple-500/50'
                        }`}
                        onClick={() => handleSelectAnswer(questions[currentStep].id, option.id)}
                      >
                        <div className="font-medium flex items-center">
                          {getOptionIcon(questions[currentStep].id, option.id)}
                          {option.text}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Submit button for multi-select questions */}
                {questions[currentStep].multiSelect && (
                  <motion.div variants={optionVariants}>
                    <Button 
                      className="mt-4 bg-gradient-to-br from-[#3B00EC] to-[#965BE4] hover:from-[#3500D4] hover:to-[#8951CC] text-white"
                      onClick={handleSubmitMultiSelect}
                      disabled={(selectedAnswers[questions[currentStep].id] as string[] || []).length === 0}
                    >
                      Continue
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
            
            {/* Call-to-action button at the end */}
            {isComplete && typingComplete && (
              <motion.div 
                variants={itemVariants}
                className="mb-8 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button 
                  onClick={handleOpenSignupModal}
                  className="px-6 py-3 bg-gradient-to-br from-[#3B00EC] to-[#965BE4] hover:from-[#3500D4] hover:to-[#8951CC] text-white text-lg font-medium rounded-xl"
                >
                  Get Your Personalized Plan
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Fixed input field at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-black/10 backdrop-blur-sm">
        <div className="max-w-[904px] mx-auto">
          <div className="rounded-xl border border-gray-700 bg-gray-900/70 shadow-lg flex items-center h-[60px] overflow-hidden">
            <div className="flex items-center gap-2 flex-1 px-4">
              <div className="flex gap-2">
                <PlusCircle 
                  width={24} 
                  height={24} 
                  className="text-blue-400" 
                  strokeWidth={2}
                />
              </div>
              <input 
                type="text" 
                placeholder="Ask me anything" 
                className="flex-1 outline-none text-white text-lg bg-transparent placeholder-gray-400"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
            </div>
            <Button 
              className="h-full aspect-square rounded-none flex items-center justify-center bg-gradient-to-br from-[#3B00EC] to-[#965BE4] hover:from-[#3500D4] hover:to-[#8951CC] p-6"
              onClick={handleSendMessage}
            >
              <Send className="w-10 h-10 text-white scale-150" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>

      {/* Signup Form Modal */}
      <SignupFormModal 
        open={isSignupModalOpen} 
        onClose={handleCloseSignupModal} 
        chatAnswers={selectedAnswers}
      />

      {/* Early Access Modal */}
      <EarlyAccessModal 
        open={showEarlyAccessModal} 
        onClose={() => setShowEarlyAccessModal(false)} 
      />
    </div>
  );
};

export default IncorporationChat; 