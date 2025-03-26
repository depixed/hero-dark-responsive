import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create the client with additional options to ensure public access works correctly
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    },
  },
});

// Enable console logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase client initialized in development mode');
}

// Make sure we have an anonymous session
// This helps with RLS policies that check for auth.uid()
const ensureSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No session found, creating anonymous session...');
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Error creating anonymous session:', error);
        throw error;
      }
      console.log('Anonymous session created:', data.session ? 'Success' : 'Failed');
      return data.session;
    }
    
    console.log('Existing session found');
    return session;
  } catch (error) {
    console.error('Error in ensureSession:', error);
    return null;
  }
};

// Call this to ensure we have a session
// This helps with RLS policies
ensureSession().catch(console.error);

// Types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  answers: Record<string, any>;
  created_at: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
}

export interface User {
  id: string;
  email: string;
  role: string;
}

// Subscriber type
export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

// Authentication functions
export const signInAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    throw error;
  }
  
  if (!session) {
    return null;
  }
  
  return session.user;
};

// Lead management functions
export const getLeads = async (): Promise<Lead[]> => {
  // Ensure we have a session before querying
  const session = await ensureSession();
  if (!session) {
    console.warn('Unable to establish session for getLeads');
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }

  return data || [];
};

export const getLead = async (id: string): Promise<Lead | null> => {
  // Ensure we have a session before querying
  const session = await ensureSession();
  if (!session) {
    console.warn('Unable to establish session for getLead');
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching lead:', error);
    throw error;
  }

  return data;
};

export const createLead = async (lead: Omit<Lead, 'id' | 'created_at'>): Promise<Lead> => {
  // Ensure we have a session before trying to insert
  const session = await ensureSession();
  if (!session) {
    console.warn('Unable to establish session for createLead - may encounter RLS errors');
  }
  
  console.log('Creating lead with session:', !!session);
  
  const { data, error } = await supabase
    .from('leads')
    .insert([{ ...lead, status: lead.status || 'new' }])
    .select()
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    
    // Special handling for RLS issues
    if (error.code === '42501') {
      console.error('RLS policy error - need to fix permissions in Supabase');
      throw new Error('Authorization error - please check RLS policies in Supabase');
    }
    
    throw error;
  }

  return data;
};

export const deleteLead = async (id: string): Promise<void> => {
  // Ensure we have a session before deleting
  const session = await ensureSession();
  if (!session) {
    console.warn('Unable to establish session for deleteLead');
  }
  
  console.log('Deleting lead with ID:', id);
  
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting lead:', error);
    
    // Special handling for RLS issues
    if (error.code === '42501') {
      console.error('RLS policy error - need to fix permissions in Supabase');
      throw new Error('Authorization error - please check RLS policies in Supabase');
    }
    
    throw error;
  }
};

export const updateLeadStatus = async (id: string, status: Lead['status']): Promise<Lead> => {
  // Ensure we have a session before updating
  const session = await ensureSession();
  if (!session) {
    throw new Error('No authenticated session available');
  }
  
  console.log('Updating lead status:', { id, status });
  
  // First verify the lead exists
  const { data: existingLead, error: fetchError } = await supabase
    .from('leads')
    .select()
    .eq('id', id)
    .single();
    
  if (fetchError || !existingLead) {
    console.error('Lead not found:', id);
    throw new Error(`Lead with ID ${id} not found`);
  }
  
  // Then perform the update
  const { data, error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating lead status:', error);
    
    if (error.code === '42501') {
      throw new Error('Permission denied: Unable to update lead status. Please check Supabase RLS policies.');
    }
    
    throw error;
  }

  if (!data) {
    throw new Error('Failed to update lead status - no data returned');
  }

  return data;
};

export const deleteLeads = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return;
  
  // Ensure we have a session before deleting
  const session = await ensureSession();
  if (!session) {
    console.warn('Unable to establish session for bulk deleteLeads');
  }
  
  console.log(`Bulk deleting ${ids.length} leads`);
  
  const { error } = await supabase
    .from('leads')
    .delete()
    .in('id', ids);

  if (error) {
    console.error('Error bulk deleting leads:', error);
    
    // Special handling for RLS issues
    if (error.code === '42501') {
      console.error('RLS policy error - need to fix permissions in Supabase');
      throw new Error('Authorization error - please check RLS policies in Supabase');
    }
    
    throw error;
  }
  
  console.log(`${ids.length} leads deleted successfully`);
};

// Function to send OTP
export const sendOTP = async (email: string): Promise<string> => {
  // Generate a 6-digit OTP for display in the UI
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`OTP for ${email}: ${otp}`);
  
  try {
    // Use Supabase's built-in email OTP system
    // This will actually send an email if Supabase is configured properly
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Don't create a user session, we just want the email
        shouldCreateUser: false,
        emailRedirectTo: window.location.origin,
        // Add custom data to identify this as our app's OTP
        data: {
          purpose: 'incorporation_otp',
        }
      }
    });

    if (error) {
      console.error('Error sending OTP email:', error);
      throw error;
    }
    
    console.log('OTP email sent successfully');
    
    // Store the OTP in localStorage as a fallback
    // IMPORTANT: In a real application, NEVER store OTPs in localStorage!
    // This is for demonstration purposes only
    localStorage.setItem(`otp_${email}`, otp);
    
    return otp;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    // Return the generated OTP even if the email fails
    // so the user can still test the form
    return otp;
  }
};

// Function to verify OTP
export const verifyOTP = async (email: string, otp: string, storedOtp?: string): Promise<boolean> => {
  // In a real app, this would validate against a backend API
  console.log('Verifying OTP:', otp, 'for email:', email);
  
  // If we have a stored OTP from generating it in the same session
  if (storedOtp && otp === storedOtp) {
    console.log('OTP verification successful (from stored OTP)');
    return true;
  }
  
  // For the demo, hard-code the expected OTP
  if (otp === '123456') {
    console.log('OTP verification successful (using default)');
    return true;
  }
  
  const localStorageOTP = localStorage.getItem(`otp_${email}`);
  
  if (localStorageOTP && localStorageOTP === otp) {
    // Clear the OTP after successful verification
    localStorage.removeItem(`otp_${email}`);
    console.log('OTP verification successful (from localStorage)');
    return true;
  }
  
  console.log('OTP verification failed');
  return false;
};

// Email verification with OTP
export const signInWithOtp = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    }
  });

  if (error) {
    throw error;
  }

  return data;
};

// Create a new subscriber
export const createSubscriber = async (email: string) => {
  await ensureSession();
  const { data, error } = await supabase
    .from('subscribers')
    .insert([{ email }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all subscribers
export const getSubscribers = async () => {
  await ensureSession();
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Subscriber[];
};

export default supabase; 