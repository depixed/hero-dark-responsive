import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '../hooks/use-mobile';
import SignupFormModal from './FixedSignupFormModal';
import EarlyAccessPopup from './EarlyAccessPopup';
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
  Briefcase, 
  BookCheck, 
  Shield, 
  HeartPulse, 
  CheckCircle2, 
  PlusCircle, 
  Send,
  Ban,
  TrendingUp,
  Coins,
  BarChart2,
  BarChartBig,
  MapPin,       
  FileBadge,    
  CalendarCheck,
  UsersRound,   
  Banknote,     
  Receipt,      
  Target,       
  AlertTriangle,
  Flag,         
  Factory,      
  Server,       
  Package,      
  MessageSquareWarning,
  ListChecks,    
  Trash2,      
  Clock,
  LocateFixed,   // Added for Relocate
  Lightbulb,      // Added for Explore Market
  Info,          // Added for Info
  ChevronRight,  // Added for Info
  Check,         // Added for Info
  Star           // Added for Info
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

// --- Define Question Sets OUTSIDE Component ---

// Original questions (for reference or initial steps)
export const questions: Question[] = [
  {
    id: 'company_status',
    text: 'Do you have an existing incorporated/registered company?',
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
    text: 'What is the main reason you are setting up a company in the UAE?',
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
    id: 'annual_revenue',
    text: 'What is your current annual revenue range (if any)?',
    options: [
      { id: 'no_revenue', text: 'No current revenue' },
      { id: 'below_500k', text: 'Below AED 500,000' },
      { id: '500k_2m', text: 'AED 500,000 - 2 million' },
      { id: 'above_2m', text: 'Above AED 2 million' },
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

// Branching question
export const incorporationCountryQuestion: Question = {
    id: 'incorporation_country',
    text: 'Please select the region where your company is incorporated/registered.',
    options: [ { id: 'uae', text: 'UAE' }, { id: 'other', text: 'Other Country' } ]
};

// New Company Flow Questions (Extracted)
export const questions_new_company: Question[] = [
    { id: 'business_activity', text: 'What is your planned business activity?', subtext: 'Choose one that best describes your business', options: [ { id: 'agriculture', text: 'Agriculture' }, { id: 'apparel', text: 'Apparel' }, { id: 'banking', text: 'Banking' }, { id: 'consulting', text: 'Consulting' }, { id: 'biotechnology', text: 'Biotechnology' }, { id: 'chemicals', text: 'Chemicals' }, { id: 'communication', text: 'Communication' }, { id: 'media', text: 'Media' }, { id: 'other', text: 'Other' } ] },
    { id: 'setup_reason', text: "What is the main reason you're setting up a company in the UAE?", subtext: 'Select one', options: [ { id: 'foreign_ownership', text: '100% foreign ownership' }, { id: 'tax_optimization', text: 'Tax optimization' }, { id: 'uae_market', text: 'Access to UAE market' }, { id: 'gcc_market', text: 'Access to GCC market' }, { id: 'residency_visa', text: 'Residency visa' }, { id: 'investor_friendly', text: 'Investor-friendly regulations' }, { id: 'other', text: 'Other' } ] },
    { id: 'shareholders_count', text: 'How many shareholders will your company have?', options: [ { id: '1', text: '1' }, { id: '2-5', text: '2-5' }, { id: 'more_than_5', text: 'More than 5' } ] },
    { id: 'shareholder_nationalities', text: 'What are the nationalities of the shareholders?', options: [ { id: 'uae', text: 'UAE National' }, { id: 'gcc', text: 'GCC National' }, { id: 'non_gcc', text: 'Non-GCC National' }, { id: 'mixed', text: 'Mixed' } ] },
    { id: 'physical_office', text: 'Will your business require a physical office space?', options: [ { id: 'yes', text: 'Yes' }, { id: 'no', text: 'No' }, { id: 'not_sure', text: 'Not sure yet' } ] },
    { id: 'annual_revenue', text: 'What is your current annual revenue range (if any)?', options: [ { id: 'no_revenue', text: 'No current revenue' }, { id: 'below_500k', text: 'Below AED 500,000' }, { id: '500k_2m', text: 'AED 500,000 - 2 million' }, { id: 'above_2m', text: 'Above AED 2 million' }, { id: 'no_answer', text: 'Prefer not to say' } ] },
    { id: 'additional_services_new', text: 'Would you like assistance with any of the following?', subtext: 'Select all that apply', multiSelect: true, options: [ { id: 'bank_account', text: 'Opening a business bank account' }, { id: 'visa_residency', text: 'Visa & Residency setup' }, { id: 'accounting_tax', text: 'Accounting & Tax registration' }, { id: 'insurance', text: 'Insurance setup' }, { id: 'medical', text: 'Medical appointment' }, { id: 'all', text: 'All of the above' } ] }
];

// Existing UAE Company Flow Questions (Extracted)
export const questions_existing_uae: Question[] = [
    { id: 'emirate_location', text: 'In which Emirate and Free Zone (or Mainland) is your company registered?', options: [ { id: 'dubai_mainland', text: 'Dubai Mainland' }, { id: 'dubai_fz', text: 'Dubai Free Zone (e.g., DMCC, JAFZA)' }, { id: 'ad_mainland', text: 'Abu Dhabi Mainland' }, { id: 'ad_fz', text: 'Abu Dhabi Free Zone (e.g., ADGM)' }, { id: 'shj_mainland', text: 'Sharjah Mainland' }, { id: 'shj_fz', text: 'Sharjah Free Zone (e.g., SAIF Zone)' }, { id: 'other_emirate_mainland', text: 'Other Emirate Mainland' }, { id: 'other_emirate_fz', text: 'Other Emirate Free Zone' } ] },
    { id: 'legal_structure_uae', text: "What is your company's legal structure?", options: [ { id: 'fz_llc', text: 'FZ-LLC' }, { id: 'fze', text: 'FZE' }, { id: 'mainland_llc', text: 'Mainland LLC' }, { id: 'other', text: 'Other' } ] },
    { id: 'license_validity', text: 'Are your license and establishment card currently valid and up-to-date?', options: [ { id: 'yes', text: 'Yes' }, { id: 'no', text: 'No' }, { id: 'unsure', text: 'Unsure' } ] },
    { id: 'visa_count_uae', text: 'How many visas are currently sponsored under the company?', options: [ { id: '0', text: '0' }, { id: '1-5', text: '1-5' }, { id: '6-10', text: '6-10' }, { id: 'more_than_10', text: 'More than 10' } ] },
    { id: 'office_type_uae', text: 'Do you have a physical office, flexi-desk, or virtual office in the UAE?', options: [ { id: 'physical', text: 'Physical office' }, { id: 'flexi', text: 'Flexi-desk' }, { id: 'virtual', text: 'Virtual office' } ] },
    { id: 'bank_account_uae', text: 'Do you have active UAE corporate bank accounts?', options: [ { id: 'yes_enbd', text: 'Yes, with Emirates NBD' }, { id: 'yes_adcb', text: 'Yes, with ADCB' }, { id: 'yes_mashreq', text: 'Yes, with Mashreq' }, { id: 'yes_other', text: 'Yes, with another bank' }, { id: 'no', text: 'No' } ] },
    { id: 'vat_status_uae', text: 'Are you registered for VAT in the UAE?', options: [ { id: 'yes', text: 'Yes' }, { id: 'no', text: 'No' }, { id: 'na', text: 'Not Applicable' } ] },
    { id: 'annual_revenue_uae', text: 'What is your approximate annual revenue range?', options: [ { id: 'below_1m', text: 'Below AED 1 million' }, { id: '1m_5m', text: 'AED 1 million - 5 million' }, { id: 'above_5m', text: 'Above AED 5 million' }, { id: 'no_answer', text: 'Prefer not to say' } ] },
    { id: 'goals_uae', text: 'What are your primary goals for your existing UAE company?', subtext: 'Select all that apply', multiSelect: true, options: [ { id: 'compliance', text: 'Ensure UAE compliance (license renewals, amendments)' }, { id: 'manage_visas', text: 'Manage employee visas (new applications, renewals, cancellations)' }, { id: 'vat_assistance', text: 'Assistance with UAE VAT registration/filing' }, { id: 'accounting', text: 'Bookkeeping/Accounting services tailored for UAE' }, { id: 'banking', text: 'Open/manage additional UAE corporate bank accounts' }, { id: 'restructure', text: 'Restructure company (e.g., add partners, change activity)' }, { id: 'liquidate', text: 'Liquidate the company' } ] },
    { id: 'challenges_uae', text: 'Are you facing any specific challenges with your current UAE setup?', options: [ { id: 'none', text: 'No challenges' }, { id: 'banking', text: 'Banking issues' }, { id: 'visa_delays', text: 'Visa processing delays' }, { id: 'compliance', text: 'Compliance difficulties' }, { id: 'other', text: 'Other' } ] }
];

// Existing Other Country Company Flow Questions (Extracted)
export const questions_existing_other: Question[] = [
    { id: 'origin_country', text: 'In which country is your company currently incorporated?', options: [ { id: 'us', text: 'United States' }, { id: 'uk', text: 'United Kingdom' }, { id: 'india', text: 'India' }, { id: 'singapore', text: 'Singapore' }, { id: 'other', text: 'Other' } ] },
    { id: 'industry_other', text: 'What industry does your company operate in?', options: [ { id: 'agriculture', text: 'Agriculture' }, { id: 'apparel', text: 'Apparel' }, { id: 'banking', text: 'Banking' }, { id: 'consulting', text: 'Consulting' }, { id: 'biotechnology', text: 'Biotechnology' }, { id: 'chemicals', text: 'Chemicals' }, { id: 'communication', text: 'Communication' }, { id: 'media', text: 'Media' }, { id: 'other', text: 'Other' } ] },
    { id: 'annual_revenue_other', text: 'What is your approximate annual revenue range?', options: [ { id: 'below_500k_usd', text: 'Below $500,000' }, { id: '500k_2m_usd', text: '$500,000 - $2 million' }, { id: 'above_2m_usd', text: 'Above $2 million' }, { id: 'no_answer', text: 'Prefer not to say' } ] },
    { id: 'interest_reason_other', text: 'Why are you interested in UAE business services?', options: [ { id: 'new_presence', text: 'Establish a new business presence in the UAE (subsidiary, branch, new company)' }, { id: 'banking_access', text: 'Access corporate banking in the UAE' }, { id: 'relocate', text: 'Relocate existing business operations to the UAE' }, { id: 'explore_market', text: 'Explore the UAE market' }, { id: 'other', text: 'Other' } ] },
    { id: 'planned_activity_uae', text: 'What type of business activities do you plan to conduct in the UAE?', options: [ { id: 'trading', text: 'Trading' }, { id: 'consulting', text: 'Consulting' }, { id: 'manufacturing', text: 'Manufacturing' }, { id: 'technology', text: 'Technology' }, { id: 'other', text: 'Other' } ] },
    { id: 'shareholders_count_uae', text: 'Approximately how many owners/shareholders would the UAE entity have?', options: [ { id: '1', text: '1' }, { id: '2-5', text: '2-5' }, { id: 'more_than_5', text: 'More than 5' } ] },
    { id: 'visa_needs_uae', text: 'Do you anticipate needing employee visas for the UAE entity in the first year?', options: [ { id: 'no', text: 'No' }, { id: 'yes_1_5', text: 'Yes, 1-5 visas' }, { id: 'yes_6_10', text: 'Yes, 6-10 visas' }, { id: 'yes_10_plus', text: 'Yes, more than 10 visas' } ] },
    { id: 'preferred_location_uae', text: 'Do you have a preferred Emirate or Free Zone in mind?', options: [ { id: 'dubai', text: 'Dubai' }, { id: 'abu_dhabi', text: 'Abu Dhabi' }, { id: 'sharjah', text: 'Sharjah' }, { id: 'other', text: 'Other' }, { id: 'no_preference', text: 'No preference' } ] }
];

// --- END Question Set Definitions ---

// Helper function to get appropriate icon for the QUESTION HEADER
const getQuestionHeaderIcon = (questionId: string): JSX.Element => {
  switch (questionId) {
    // Specific overrides requested
    case 'license_validity':
      return <FileBadge className="w-5 h-5 mr-2 text-blue-400" />;
    case 'visa_needs_uae':
    case 'visa_count_uae': // Added consistency for UAE flow
      return <Passport className="w-5 h-5 mr-2 text-blue-400" />; // FileText aliased
    case 'bank_account_uae':
      return <Banknote className="w-5 h-5 mr-2 text-blue-400" />;
    case 'vat_status_uae':
      return <Receipt className="w-5 h-5 mr-2 text-blue-400" />;
    case 'challenges_uae':
      return <AlertTriangle className="w-5 h-5 mr-2 text-blue-400" />;

    // Existing special cases
    case 'annual_revenue':
    case 'annual_revenue_uae':
    case 'annual_revenue_other':
      return <BarChartBig className="w-5 h-5 mr-2 text-blue-400" />;
    case 'incorporation_country':
      return <Flag className="w-5 h-5 mr-2 text-blue-400" />;
    
    // General cases (can derive from getOptionIcon logic if needed, but HelpCircle is safe)
    case 'company_status':
      return <Building2 className="w-5 h-5 mr-2 text-blue-400" />; // Or CirclePlus? Building2 seems more encompassing
    case 'business_activity':
    case 'industry_other':
       return <Briefcase className="w-5 h-5 mr-2 text-blue-400" />; // Generic business icon
    case 'setup_reason':
       return <Target className="w-5 h-5 mr-2 text-blue-400" />;
    case 'shareholders_count':
    case 'shareholders_count_uae':
       return <Users className="w-5 h-5 mr-2 text-blue-400" />;
    case 'shareholder_nationalities':
        return <Globe className="w-5 h-5 mr-2 text-blue-400" />;
    case 'physical_office':
    case 'office_type_uae':
        return <Building className="w-5 h-5 mr-2 text-blue-400" />;
    case 'additional_services_new':
    case 'goals_uae': // Maybe a specific goal icon? Target is okay.
        return <ListChecks className="w-5 h-5 mr-2 text-blue-400" />;
    case 'emirate_location':
    case 'preferred_location_uae':
        return <MapPin className="w-5 h-5 mr-2 text-blue-400" />;
    case 'legal_structure_uae':
        return <FileBadge className="w-5 h-5 mr-2 text-blue-400" />; // Consistent with license
    case 'origin_country':
        return <Flag className="w-5 h-5 mr-2 text-blue-400" />; // Consistent
    case 'interest_reason_other':
        return <Lightbulb className="w-5 h-5 mr-2 text-blue-400" />;
    case 'planned_activity_uae':
         return <Package className="w-5 h-5 mr-2 text-blue-400" />;

    // Default fallback
    default:
      return <HelpCircle className="w-5 h-5 mr-2 text-blue-400" />;
  }
};

// Helper function to get appropriate icon for answer options
const getOptionIcon = (questionId: string, optionId: string): JSX.Element => {
  // Company status icons
  if (questionId === 'company_status') {
    if (optionId === 'existing') {
      return <Building2 className="w-5 h-5 mr-2" />;
    } else if (optionId === 'new') {
      return <CirclePlus className="w-5 h-5 mr-2" />;
    }
  }
  
  // Business activity icons (Handles both business_activity AND industry_other)
  if (questionId === 'business_activity' || questionId === 'industry_other') {
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
  
  // Annual Revenue icons
  if (questionId === 'annual_revenue') {
    switch (optionId) {
      case 'no_revenue':
        return <Ban className="w-5 h-5 mr-2 text-red-400" />;
      case 'below_500k':
        return <Coins className="w-5 h-5 mr-2" />;
      case '500k_2m':
        return <BarChart2 className="w-5 h-5 mr-2" />;
      case 'above_2m':
        return <TrendingUp className="w-5 h-5 mr-2 text-green-400" />;
      case 'no_answer':
        return <HelpCircle className="w-5 h-5 mr-2" />;
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
        return <ListChecks className="w-5 h-5 mr-2" />;
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
  
  // --- Icons for Existing Company Flows ---
  
  // --- Existing UAE Company Questions ---
  if (questionId === 'emirate_location') { // Existing UAE
     switch (optionId) {
        case 'dubai_mainland': 
        case 'ad_mainland': 
        case 'shj_mainland': 
        case 'other_emirate_mainland': 
           return <MapPin className="w-5 h-5 mr-2" />; // Mainland
        case 'dubai_fz': 
        case 'ad_fz': 
        case 'shj_fz': 
        case 'other_emirate_fz': 
           return <Building className="w-5 h-5 mr-2" />; // Free Zone (using Building generic)
        default: return <MapPin className="w-5 h-5 mr-2" />; 
     }
  }
  if (questionId === 'legal_structure_uae') { // Existing UAE
      switch (optionId) {
         case 'fz_llc': 
         case 'fze': 
         case 'mainland_llc': 
            return <FileBadge className="w-5 h-5 mr-2" />; // Legal structure badge
         default: return <FileBadge className="w-5 h-5 mr-2" />;
      }
   }
  if (questionId === 'license_validity') { // Existing UAE
      switch (optionId) {
         case 'yes': return <CalendarCheck className="w-5 h-5 mr-2 text-green-400" />;
         case 'no': return <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />;
         case 'unsure': return <HelpCircle className="w-5 h-5 mr-2" />;
         default: return <CalendarCheck className="w-5 h-5 mr-2" />;
      }
  }
   if (questionId === 'visa_count_uae') { // Existing UAE
      switch (optionId) {
         case '0': return <User className="w-5 h-5 mr-2" />;
         case '1-5':
         case '6-10':
         case 'more_than_10': 
            return <UsersRound className="w-5 h-5 mr-2" />;
         default: return <UsersRound className="w-5 h-5 mr-2" />;
      }
  }
  if (questionId === 'office_type_uae') { // Existing UAE
      switch (optionId) {
         case 'physical': return <Building className="w-5 h-5 mr-2" />;
         case 'flexi': return <Briefcase className="w-5 h-5 mr-2" />; // Using briefcase for flexi
         case 'virtual': return <Server className="w-5 h-5 mr-2" />; // Using server for virtual
         default: return <Building className="w-5 h-5 mr-2" />;
      }
  }
   if (questionId === 'bank_account_uae') { // Existing UAE
      switch (optionId) {
         case 'yes_enbd':
         case 'yes_adcb':
         case 'yes_mashreq':
         case 'yes_other': 
            return <Banknote className="w-5 h-5 mr-2 text-green-400" />;
         case 'no': return <Ban className="w-5 h-5 mr-2 text-red-400" />;
         default: return <Banknote className="w-5 h-5 mr-2" />;
      }
  }
   if (questionId === 'vat_status_uae') { // Existing UAE
      switch (optionId) {
         case 'yes': return <Receipt className="w-5 h-5 mr-2 text-green-400" />;
         case 'no': return <Receipt className="w-5 h-5 mr-2 text-gray-400" />; // Neutral/grey for No
         case 'na': return <Ban className="w-5 h-5 mr-2" />; // Ban for N/A
         default: return <Receipt className="w-5 h-5 mr-2" />;
      }
  }
   if (questionId === 'annual_revenue_uae') { // Existing UAE
      switch (optionId) {
         case 'below_1m': return <Coins className="w-5 h-5 mr-2" />;
         case '1m_5m': return <BarChart2 className="w-5 h-5 mr-2" />;
         case 'above_5m': return <TrendingUp className="w-5 h-5 mr-2 text-green-400" />;
         case 'no_answer': return <HelpCircle className="w-5 h-5 mr-2" />;
         default: return <Coins className="w-5 h-5 mr-2" />;
      }
  }
  if (questionId === 'goals_uae') { // Existing UAE Multi-select - ADDED ICONS
     switch (optionId) {
        case 'compliance': return <BookCheck className="w-5 h-5 mr-2" />;
        case 'manage_visas': return <UsersRound className="w-5 h-5 mr-2" />;
        case 'vat_assistance': return <Receipt className="w-5 h-5 mr-2" />;
        case 'accounting': return <Briefcase className="w-5 h-5 mr-2" />;
        case 'banking': return <Banknote className="w-5 h-5 mr-2" />;
        case 'restructure': return <ArrowRightLeft className="w-5 h-5 mr-2" />;
        case 'liquidate': return <Trash2 className="w-5 h-5 mr-2" />;
        default: return <Target className="w-5 h-5 mr-2" />; 
     }
  }
  if (questionId === 'challenges_uae') { // Existing UAE
      switch (optionId) {
         case 'none': return <CheckCircle2 className="w-5 h-5 mr-2 text-green-400" />;
         case 'banking': return <Banknote className="w-5 h-5 mr-2 text-orange-400" />;
         case 'visa_delays': return <Clock className="w-5 h-5 mr-2 text-orange-400" />;
         case 'compliance': return <FileBadge className="w-5 h-5 mr-2 text-orange-400" />;
         case 'other': return <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />;
         default: return <AlertTriangle className="w-5 h-5 mr-2" />;
      }
   }
   
  // --- Existing Other Country Company Questions ---
   if (questionId === 'origin_country') { // Existing Other
      switch (optionId) {
         case 'us': 
         case 'uk': 
         case 'india': 
         case 'singapore': 
         case 'other': 
            return <Flag className="w-5 h-5 mr-2" />; 
         default: return <Flag className="w-5 h-5 mr-2" />;
      }
   }
   // industry_other uses the same logic as business_activity, handled above
   if (questionId === 'annual_revenue_other') { // Existing Other
      switch (optionId) {
         case 'below_500k_usd': return <Coins className="w-5 h-5 mr-2" />;
         case '500k_2m_usd': return <BarChart2 className="w-5 h-5 mr-2" />;
         case 'above_2m_usd': return <TrendingUp className="w-5 h-5 mr-2 text-green-400" />;
         case 'no_answer': return <HelpCircle className="w-5 h-5 mr-2" />;
         default: return <Coins className="w-5 h-5 mr-2" />;
      }
  }
  if (questionId === 'interest_reason_other') { // Existing Other - ADDED ICONS
      switch (optionId) {
         case 'new_presence': return <Building2 className="w-5 h-5 mr-2" />;
         case 'banking_access': return <Banknote className="w-5 h-5 mr-2" />;
         case 'relocate': return <LocateFixed className="w-5 h-5 mr-2" />;
         case 'explore_market': return <Lightbulb className="w-5 h-5 mr-2" />;
         default: return <HelpCircle className="w-5 h-5 mr-2" />;
      }
   }
   if (questionId === 'planned_activity_uae') { // Existing Other
      switch (optionId) {
         case 'trading': return <Package className="w-5 h-5 mr-2" />;
         case 'consulting': return <BrainCircuit className="w-5 h-5 mr-2" />;
         case 'manufacturing': return <Factory className="w-5 h-5 mr-2" />;
         case 'technology': return <LaptopCode className="w-5 h-5 mr-2" />;
         default: return <Package className="w-5 h-5 mr-2" />;
      }
   }
   // shareholders_count_uae uses the same logic as shareholders_count, handled above
   if (questionId === 'visa_needs_uae') { // Existing Other
      switch (optionId) {
         case 'no': return <Ban className="w-5 h-5 mr-2" />;
         case 'yes_1_5': 
         case 'yes_6_10': 
         case 'yes_10_plus': 
            return <UsersRound className="w-5 h-5 mr-2" />;
         default: return <UsersRound className="w-5 h-5 mr-2" />;
      }
   }
   if (questionId === 'preferred_location_uae') { // Existing Other
      switch (optionId) {
         case 'dubai': 
         case 'abu_dhabi': 
         case 'sharjah': 
         case 'other': 
            return <MapPin className="w-5 h-5 mr-2" />;
         case 'no_preference': return <HelpCircle className="w-5 h-5 mr-2" />;
         default: return <MapPin className="w-5 h-5 mr-2" />;
      }
   }
  
  // Added: Icons for Additional Services (New Company Flow)
  if (questionId === 'additional_services_new') {
      switch (optionId) {
          case 'bank_account': return <Banknote className="w-5 h-5 mr-2" />;
          case 'visa_residency': return <Passport className="w-5 h-5 mr-2" />;
          case 'accounting_tax': return <Briefcase className="w-5 h-5 mr-2" />;
          case 'insurance': return <Shield className="w-5 h-5 mr-2" />;
          case 'medical': return <HeartPulse className="w-5 h-5 mr-2" />;
          case 'all': return <ListChecks className="w-5 h-5 mr-2" />; // Using ListChecks for All
          default: return <HelpCircle className="w-5 h-5 mr-2" />;
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
  // --- Define service arrays INSIDE component as they use JSX ---
  const services_new = [
      { text: "UAE Company Setup Package", icon: <Building2 className="w-5 h-5 mr-2 text-blue-400" /> },
      { text: "Visa & Residency Support", icon: <Passport className="w-5 h-5 mr-2 text-blue-400" /> },
      { text: "Accounting & Compliance Package", icon: <Briefcase className="w-5 h-5 mr-2 text-blue-400" /> },
      { text: "Banking Assistance", icon: <Banknote className="w-5 h-5 mr-2 text-blue-400" /> }
  ];
  const services_existing_uae = [
      { text: "UAE License Renewal & PRO Services", icon: <FileBadge className="w-5 h-5 mr-2 text-blue-400" /> },
      { text: "Visa Processing Services", icon: <UsersRound className="w-5 h-5 mr-2 text-blue-400" /> },
      { text: "UAE VAT & Accounting Services", icon: <Receipt className="w-5 h-5 mr-2 text-blue-400" /> },
      { text: "UAE Banking Assistance", icon: <Banknote className="w-5 h-5 mr-2 text-blue-400" /> },
      { text: "Company Amendments & Restructuring", icon: <Briefcase className="w-5 h-5 mr-2 text-blue-400" /> }, 
      { text: "Company Liquidation Services", icon: <Trash2 className="w-5 h-5 mr-2 text-blue-400" /> }
  ];
  const services_existing_other = [
      { text: "UAE Incorporation Package", icon: <Building2 className="w-5 h-5 mr-2 text-blue-400" /> },
      { text: "UAE Market Entry Consultation", icon: <Globe className="w-5 h-5 mr-2 text-blue-400" /> },
      { text: "UAE Corporate Banking Assistance", icon: <Banknote className="w-5 h-5 mr-2 text-blue-400" /> }
  ];
  // --- END Service Array Definitions ---

  // Hooks
  const isMobile = useIsMobile();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // State variables 
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState(0); 
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>({});
  const [chatHistory, setChatHistory] = useState<Array<{type: 'question' | 'answer' | 'completion', content: any}>>([]); 
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isEarlyAccessOpen, setIsEarlyAccessOpen] = useState(false);
  const [activeQuestionSet, setActiveQuestionSet] = useState<Question[] | null>(null); // Start null
  const [flowType, setFlowType] = useState<'new' | 'existing_uae' | 'existing_other' | null>(null); 

  // --- Utility Functions ---
  // Function to add delay with loading animation - UPDATED
  const addNextQuestionWithDelay = (nextContent: Question | { type: 'completion'; services: { text: string; icon: JSX.Element }[] } | { text: string; subtext?: string }) => {
    setTypingComplete(false); // Reset typing flag
    setShowOptions(false);
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      let type: 'question' | 'completion' = 'question';
      let isCompletionMessage = false;
      if (typeof nextContent === 'object' && nextContent !== null && 'type' in nextContent && nextContent.type === 'completion') {
        type = 'completion';
        isCompletionMessage = true;
      } else if (typeof nextContent === 'object' && nextContent !== null && !('options' in nextContent) && 'text' in nextContent) {
         type = 'question';
      } else if (typeof nextContent === 'object' && nextContent !== null && 'options' in nextContent) {
         type = 'question';
      }

      setChatHistory(prev => [
        ...prev,
        { type: type, content: nextContent }
      ]);

      // *** FIX: Set typingComplete to true AFTER adding completion message ***
      if (isCompletionMessage) {
          setTypingComplete(true); // Allow CTA button to render
      }

    }, 800); 
  };

  // --- Event Handlers ---
  // Handle selecting an answer - UPDATED
  const handleSelectAnswer = (questionId: string, optionId: string) => {
    // Find the actual question object from history more safely
    let currentQuestionFromHistory: Question | undefined = undefined;
    if (chatHistory.length > 0) {
        const lastItem = chatHistory[chatHistory.length - 1];
        if (lastItem?.type === 'question' && typeof lastItem.content === 'object' && lastItem.content !== null && 'options' in lastItem.content && lastItem.content.id === questionId) {
            currentQuestionFromHistory = lastItem.content as Question;
        }
    }
    if (!currentQuestionFromHistory) { console.error("Could not find triggering question in history for ID:", questionId); return; }
    const option = currentQuestionFromHistory.options.find(opt => opt.id === optionId);
    if (!option) return; 
    
    const isCurrentMultiSelect = currentQuestionFromHistory.multiSelect === true;

    // *** FIX: Only add answer bubble and proceed if NOT multi-select ***
    if (!isCurrentMultiSelect) {
        // Record single-select answer state
        setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
        // Add the answer bubble to history
        setChatHistory(prev => [...prev, { type: 'answer', content: option.text }]);
    } else {
        // For multi-select, just update the state. Answer bubble added on submit.
        const currentAnswers = selectedAnswers[questionId] as string[] || [];
        let newAnswers = [...currentAnswers];
        const hasAllOption = currentQuestionFromHistory.options.some(opt => opt.id === 'all');
        
        if (hasAllOption && optionId === 'all') {
            newAnswers = ['all'];
        } else {
            newAnswers = newAnswers.filter(id => id !== 'all'); 
            if (newAnswers.includes(optionId)) {
                newAnswers = newAnswers.filter(id => id !== optionId); 
            } else {
                newAnswers.push(optionId); 
            }
        }
        setSelectedAnswers(prev => ({ ...prev, [questionId]: newAnswers }));
        // DO NOT add to chatHistory here, DO NOT advance step
        return; 
    }

    // --- Branching Logic (Only runs for single-select answers now) ---
    if (questionId === 'company_status') {
      if (optionId === 'new') {
        setFlowType('new');
        setActiveQuestionSet(questions_new_company); 
        setCurrentStep(0); 
        addNextQuestionWithDelay(questions_new_company[0]);
      } else { // 'existing'
        addNextQuestionWithDelay(incorporationCountryQuestion); 
      }
      return; 
    }

    if (questionId === 'incorporation_country') {
        if (optionId === 'uae') {
            setFlowType('existing_uae');
            setActiveQuestionSet(questions_existing_uae); 
            setCurrentStep(0);
            addNextQuestionWithDelay(questions_existing_uae[0]);
        } else { // 'other'
            setFlowType('existing_other');
            setActiveQuestionSet(questions_existing_other); 
            setCurrentStep(0);
            addNextQuestionWithDelay(questions_existing_other[0]);
        }
        return; 
    }

    // --- General Flow Logic (Only reached for single-select, requires activeQuestionSet) ---
    if (!activeQuestionSet) {
        console.error("Processing single-select answer but activeQuestionSet is null.");
        return; 
    }
    const activeFlowQuestion = activeQuestionSet[currentStep];
    if (!activeFlowQuestion || activeFlowQuestion.id !== questionId) {
        console.warn("State mismatch during single-select advancement.", { questionId, currentStep, activeFlowQuestionId: activeFlowQuestion?.id });
        return; 
    }
    // Redundant check, but safe:
    if (activeFlowQuestion.multiSelect) { console.error("Logic Error: Multi-select reached single-select advancement path."); return; } 

    // --- Single-select: Advance or Complete ---
    const nextStep = currentStep + 1;
    if (nextStep < activeQuestionSet.length) {
      setCurrentStep(nextStep);
      addNextQuestionWithDelay(activeQuestionSet[nextStep]);
    } else {
      setIsComplete(true);
      let services = flowType === 'existing_uae' ? services_existing_uae 
                   : flowType === 'existing_other' ? services_existing_other 
                   : services_new; 
      addNextQuestionWithDelay({ type: 'completion', services: services });
    }
  };

  // Submit multi-select answers
  const handleSubmitMultiSelect = () => {
    if (!activeQuestionSet) { console.error("Cannot submit multi-select, no active set."); return; }
    const currentQuestion = activeQuestionSet[currentStep]; 
    if (!currentQuestion?.multiSelect) return;
    
    const selectedOptions = selectedAnswers[currentQuestion.id] as string[] || [];
    if (selectedOptions.length === 0) return; 
    
    const selectedTexts = selectedOptions
        .map(optionId => currentQuestion.options.find(opt => opt.id === optionId)?.text)
        .filter((text): text is string => !!text); 
    
    if (selectedTexts.length > 0) {
       setChatHistory(prev => [
         ...prev,
         { type: 'answer', content: selectedTexts.join(', ') }
       ]);
    }

    const nextStep = currentStep + 1;
    if (nextStep < activeQuestionSet.length) {
      setCurrentStep(nextStep);
      addNextQuestionWithDelay(activeQuestionSet[nextStep]);
    } else {
       setIsComplete(true);
       let services = flowType === 'existing_uae' ? services_existing_uae 
                    : flowType === 'existing_other' ? services_existing_other 
                    : services_new; 
       addNextQuestionWithDelay({ type: 'completion', services: services });
    }
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

  // Handle send message - now opens the early access popup
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Open early access popup instead of sending message
    setIsEarlyAccessOpen(true);
  };

  // Handle closing early access popup
  const handleCloseEarlyAccess = () => {
    setIsEarlyAccessOpen(false);
  };

  // Handle typing complete for showing options
  const handleTypingComplete = () => {
    setTypingComplete(true);
    setTimeout(() => {
      setShowOptions(true);
    }, 300);
  };

  // --- Effects ---
  // Initialize the chat
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([
        { type: 'question', content: { text: "Hi there, What would you like to know?", subtext: "Let us handle the complexities, so you can focus on your business." } }
      ]);
      // Define the first question locally for initialization
      const firstQuestion: Question = { id: 'company_status', text: 'Do you have an existing incorporated/registered company?', options: [ { id: 'new', text: 'No, I want to set up a new company' }, { id: 'existing', text: 'Yes, I have an existing company' } ] };
      setTimeout(() => setChatHistory(prev => [...prev, { type: 'question', content: firstQuestion }]), 800);
    }
  }, []); 

  // Scroll to bottom
  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatHistory, showOptions]);

  // Reset typing/options state 
  useEffect(() => {
      const lastItem = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null; // Use index access
      if (lastItem?.type === 'question' && typeof lastItem.content === 'object' && lastItem.content !== null && 'options' in lastItem.content) {
        setTypingComplete(false);
        setShowOptions(false);
      } 
  }, [chatHistory]); 

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

  // Find the index of the current question relative to its own set
  const getQuestionNumberInfo = (currentQuestionId: string): { current: number; total: number } => {
      if (!activeQuestionSet) return { current: 0, total: 0 }; // Return 0 if set not active yet
      let current = 0;
      const baseOffset = 1; 
      const branchingOffset = (flowType === 'existing_uae' || flowType === 'existing_other') ? 1 : 0;
      const totalOffset = baseOffset + branchingOffset;
      const total = activeQuestionSet.length + totalOffset;
      
      if (currentQuestionId === 'company_status') current = 1;
      else if (currentQuestionId === 'incorporation_country') current = 2;
      else {
         const indexInSet = activeQuestionSet.findIndex(q => q.id === currentQuestionId);
         if (indexInSet !== -1) current = indexInSet + 1 + totalOffset;
      }
      // Ensure current doesn't exceed total if something goes wrong
      current = Math.min(current, total);
      return { current, total };
  };

  // --- Render Logic (Use safe index access instead of findLast) ---
  return (
    <div className="flex flex-col h-screen pt-[80px] relative z-10">
      {/* Scrollable chat content */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto pb-[90px] px-4">
        <motion.div className="max-w-[904px] mx-auto" initial="hidden" animate="show" variants={containerVariants}>
          <AnimatePresence>
            {chatHistory.map((item, index) => {
              const isLastDisplayedItem = index === chatHistory.length - 1;
              const isActualQuestionWithOptions = item.type === 'question' && typeof item.content === 'object' && item.content !== null && 'options' in item.content;
              const isLastDisplayedQuestionWithOptions = isLastDisplayedItem && isActualQuestionWithOptions;
              const questionNumberInfo = isActualQuestionWithOptions ? getQuestionNumberInfo(item.content.id) : { current: 0, total: 0 };

              return (
                <motion.div key={`${item.type}-${index}-${(item.content as any)?.id || 'msg'}`} variants={itemVariants} className={`mb-6 ${item.type === 'answer' ? 'flex justify-end' : ''}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  {/* --- Question --- */}
                  {item.type === 'question' && (
                    <div className={`max-w-[80%] ${index === 0 ? 'mx-auto text-center pt-10' : ''}`}>
                      {index === 0 ? ( 
                        <div className="space-y-5">
                          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1CD2E8] via-[#965BE4] to-[#201B36]">{item.content.text}</h1>
                          {item.content.subtext && (<p className="text-base text-gray-300">{item.content.subtext}</p>)}
                        </div>
                      ) : ( 
                        <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-5 shadow-md text-white">
                           {isActualQuestionWithOptions && !isComplete && index > 0 && questionNumberInfo.current > 0 && (
                             <div className="flex items-center text-blue-400 mb-2 text-sm">
                               {getQuestionHeaderIcon(item.content.id)}
                               {/* Display numbering only if total is known (flow started) */} 
                               {questionNumberInfo.total > 0 && <span>{`${questionNumberInfo.current} of ${questionNumberInfo.total} questions`}</span>}
                             </div>
                           )}
                          <h2 className="text-lg font-bold">
                            {isLastDisplayedQuestionWithOptions ? (<TypedText text={item.content.text} onComplete={handleTypingComplete} />) : (item.content.text)}
                          </h2>
                          {item.content.subtext && (<p className="text-sm text-gray-300 mt-1"> {item.content.subtext} </p>)}
                        </div>
                      )}
                    </div>
                  )}
                  {/* --- Answer --- */}
                  {item.type === 'answer' && (<div className="bg-purple-900/30 border border-purple-700/50 text-purple-100 p-3 rounded-xl shadow-sm max-w-[80%]">{item.content}</div>)}
                  {/* --- Completion --- */}
                   {item.type === 'completion' && (
                     <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-5 shadow-md text-white max-w-[80%]">
                        <h2 className="text-lg font-bold mb-3">Great! Based on your answers, we can help you with:</h2>
                        <ul className="space-y-2 mb-4">
                          {item.content.services.map((service: {text: string, icon: JSX.Element}, serviceIndex: number) => (
                            <li key={serviceIndex} className="flex items-center text-gray-200">
                              {React.cloneElement(service.icon, { className: `w-5 h-5 mr-3 flex-shrink-0 ${service.icon.props.className || 'text-blue-400'}` })} 
                              <span>{service.text}</span>
                            </li>
                          ))}
                           <li className="flex items-center text-gray-200">
                              <PlusCircle className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400" /> 
                              <span>And much more...</span>
                           </li>
                        </ul>
                        <p className="text-sm text-gray-300 mt-1">Please submit your contact details using the button below to receive your personalized plan.</p>
                     </div>
                   )}
                </motion.div>
              );
            })}
            {/* Loading animation */} 
             {isLoading && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6"><LoadingSpinner /></motion.div>)}
             
            {/* Current question options - Use safe index access */} 
            {!isComplete && chatHistory.length > 0 &&
              (() => { 
                 const lastItem = chatHistory[chatHistory.length - 1]; // Use index access
                 if(lastItem?.type !== 'question' || !lastItem.content || !('options' in lastItem.content)) return null;
                 const currentQuestion = lastItem.content as Question;
                 
                 return showOptions && typingComplete && (
                   <motion.div 
                     variants={optionsVariants} 
                     initial="hidden" 
                     animate="show" 
                     className="mb-8" 
                     key={`options-${currentQuestion.id}`} 
                   >
                     <div className="flex flex-wrap gap-3">
                       {currentQuestion.options.map((option) => {
                         const currentSelected = selectedAnswers[currentQuestion.id];
                         const isSelected = currentQuestion.multiSelect
                           ? (currentSelected as string[] || []).includes(option.id)
                           : currentSelected === option.id;
                         return (
                           <motion.div key={option.id} variants={optionVariants} className={`p-3 border rounded-xl cursor-pointer transition-all ${ isSelected ? 'border-purple-500 bg-purple-900/30 text-purple-100' : 'border-gray-700 bg-gray-800/70 text-gray-100 hover:border-purple-500/50' }`} onClick={() => handleSelectAnswer(currentQuestion.id, option.id)}>
                             <div className="font-medium flex items-center">{getOptionIcon(currentQuestion.id, option.id)}{option.text}</div>
                           </motion.div>
                         );
                       })}
                     </div>
                     {/* Submit button for multi-select - Use safe access */} 
                     {currentQuestion.multiSelect && (
                       <motion.div variants={optionVariants}>
                         <Button 
                            className="mt-4 bg-gradient-to-br from-[#3B00EC] to-[#965BE4] hover:from-[#3500D4] hover:to-[#8951CC] text-white" 
                            onClick={handleSubmitMultiSelect} 
                            // Use safe access for disabled check
                            disabled={!(selectedAnswers[currentQuestion.id] as string[] || []).length}
                          >
                           Continue
                         </Button>
                       </motion.div>
                     )}
                   </motion.div>
                 );
              })()
            }
            {/* CTA button */} 
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
              className="h-full aspect-square rounded-none flex items-center justify-center bg-gradient-to-br from-[#3B00EC] to-[#965BE4] hover:from-[#3500D4] hover:to-[#8951CC] p-4"
              onClick={handleSendMessage}
            >
              <Send className="w-7 h-7 text-white" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>

      {/* Signup Form Modal */}
      <SignupFormModal 
        open={isSignupModalOpen} 
        onClose={handleCloseSignupModal} 
        chatAnswers={selectedAnswers} // Pass the comprehensive answers
      />

      {/* Early Access Popup */}
      <EarlyAccessPopup
        open={isEarlyAccessOpen}
        onClose={handleCloseEarlyAccess}
      />
    </div>
  );
};

export default IncorporationChat; 