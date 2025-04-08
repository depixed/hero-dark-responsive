import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Send, 
  User, 
  Bot, 
  Clock, 
  ArrowDown, 
  Plus, 
  Trash2,
  Paperclip, // For attachments
  X,           // For removing selected file
  FileText,    // For file icon
  Image,       // For image icon
  Download     // For downloading files
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import supabase from '../lib/supabase';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface AiSettings {
  id?: string;
  openai_api_key?: string;
  google_gemini_api_key?: string;
  default_ai_provider?: 'openai' | 'gemini';
}

const AiChatPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [aiSettings, setAiSettings] = useState<AiSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isNewChatPending, setIsNewChatPending] = useState(false);
  
  // File attachment states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch AI Settings
  useEffect(() => {
    const fetchAiSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const { data, error } = await supabase
          .from('ai_settings')
          .select('*')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setAiSettings(data);
        } else {
          // Handle case where no settings are found - maybe show a message?
          console.warn('AI settings not found in database.');
          toast.error('AI Settings not configured. Please contact an administrator.', { duration: 5000 });
          setAiSettings(null); // Ensure it's null if not found
        }
      } catch (error) {
        console.error('Error fetching AI settings:', error);
        toast.error('Failed to load AI configuration.');
        setAiSettings(null);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchAiSettings();
  }, []);

  // Initial greeting or load first session if available
  useEffect(() => {
    if (!isLoadingSettings && sessions.length > 0 && !activeSession) {
      loadChatSession(sessions[0].id); // Load the most recent session by default
    } else if (!isLoadingSettings && messages.length === 0 && !activeSession && sessions.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I\'m your AI assistant from Incorpify. How can I help you with your business today?',
          timestamp: new Date()
        }
      ]);
    }
  }, [sessions, isLoadingSettings, messages, activeSession]);

  // Load chat sessions
  useEffect(() => {
    const fetchChatSessions = async () => {
      if (!user) return;
      setIsLoadingHistory(true); // Use this flag to show loading state for sessions list
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*') // Fetch all columns, including user_id
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          setSessions(data);
        }
      } catch (error) {
        console.error('Error fetching chat sessions:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (user) {
    fetchChatSessions();
    }
  }, [user]);

  // Remove the bucket creation effect and replace with a simpler check
  useEffect(() => {
    const checkStorageAccess = async () => {
      if (!user) return;
      
      try {
        // Just try to list the bucket contents to check for basic access
        const { data, error } = await supabase.storage
          .from('chat_attachments')
          .list(user.id);
        
        if (error && error.message !== 'The resource was not found') {
          console.warn('Storage access check:', error.message);
        }
      } catch (error) {
        console.warn('Error checking storage access:', error);
      }
    };
    
    checkStorageAccess();
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatSession = async (sessionId: string) => {
    if (!user || isLoadingHistory) return;
    
    setIsLoadingHistory(true);
    setMessages([]); 
    setIsNewChatPending(false); // Ensure pending state is cleared when loading existing chat
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      
      if (data) {
        const loadedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(loadedMessages);
        setActiveSession(sessionId);
      }
    } catch (error) {
      console.error('Error loading chat session:', error);
      toast.error('Failed to load chat history.');
    } finally {
      setIsLoadingHistory(false);
      inputRef.current?.focus();
    }
  };

  const createNewSession = async () => {
    if (!user) return;
    
    // Create a new session immediately in the database
    try {
      // Show loading state
      setLoading(true);
      
      // Create new session in database with placeholder title
      const { data: newSessionData, error } = await supabase
        .from('chat_sessions')
        .insert([
          { 
            user_id: user.id,
            title: "New Chat",
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      if (!newSessionData) throw new Error("Failed to create new session");
      
      // Set the new session as active
      setActiveSession(newSessionData.id);
      
      // Add to session list and move to top
      setSessions(prev => [newSessionData, ...prev]);
      
      // Clear messages except for initial greeting
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! Starting a new chat. How can I assist you?',
          timestamp: new Date()
        }
      ]);
      
      // Save initial greeting message
      const welcomeMessage = {
        role: 'assistant' as const,
        content: 'Hello! Starting a new chat. How can I assist you?',
        timestamp: new Date()
      };
      
      await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: newSessionData.id,
            role: welcomeMessage.role,
            content: welcomeMessage.content,
            timestamp: welcomeMessage.timestamp.toISOString()
          }
        ]);
        
      // Clear input and focus
      setInput('');
      inputRef.current?.focus();
      
    } catch (error) {
      console.error('Error creating new chat session:', error);
      toast.error('Failed to create new chat');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }); // Simplified date format
  };

  const saveMessage = async (message: Message, sessionId: string | null): Promise<{ messageId: string | null; sessionId: string | null }> => {
    if (!user) return { messageId: null, sessionId: null };
    
    try {
      let currentSessionId = sessionId;
      let isNewSession = false; // Flag to check if we need to generate title
      
      if (!currentSessionId && message.role === 'user') {
        // This is the first *user* message of a new session
        isNewSession = true;
        setIsNewChatPending(false); 
        const temporaryTitle = "New Chat..."; // Use a temporary title
          
        const { data: newSessionData, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert([
            { 
              user_id: user.id,
              title: temporaryTitle, // Save with temporary title first
              created_at: new Date().toISOString(), // Ensure created_at is set
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (sessionError) throw sessionError;
        if (!newSessionData) throw new Error("Failed to create new session.");
        
        currentSessionId = newSessionData.id;
        setActiveSession(currentSessionId);
        setSessions(prev => [newSessionData, ...prev]);
      } else if (currentSessionId) {
        // Update the updated_at timestamp for the existing session
        const { error: updateError } = await supabase
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentSessionId);
          
        if (updateError) console.error('Error updating session timestamp:', updateError);
          
        // Move updated session to the top only if it's not the first message being saved
        // (already handled for new sessions)
        if (!isNewSession) {
          setSessions(prev => {
            const updatedSession = prev.find(s => s.id === currentSessionId);
            if (!updatedSession) return prev;
            const otherSessions = prev.filter(s => s.id !== currentSessionId);
            return [{ ...updatedSession, updated_at: new Date().toISOString() }, ...otherSessions];
          });
        }
      }
      
      // --- Save the message itself ---
      if (!currentSessionId) {
        // Should not happen if we just created a session, but as a safeguard
        console.error("Session ID is null, cannot save message.");
        throw new Error("Cannot save message without a session ID.");
      }
      
      const { data: messageData, error: messageError } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: currentSessionId,
            role: message.role,
            content: message.content,
            timestamp: message.timestamp.toISOString(),
            attachment_url: message.attachment_url || null,
            attachment_type: message.attachment_type || null,
            attachment_name: message.attachment_name || null
          }
        ])
        .select('id') 
        .single();

      if (messageError) throw messageError;
      if (!messageData) throw new Error("Failed to save message.");
      
      // Update message state with the saved ID
      setMessages(prev => prev.map(msg => 
        (msg.role === message.role && msg.timestamp === message.timestamp && !msg.id)
          ? { ...msg, id: messageData.id } 
          : msg
      ));

      // --- Generate title asynchronously if it was a new session created by user message ---
      if (isNewSession && message.role === 'user' && currentSessionId) {
         // Don't await this, let it run in the background
         generateAndSaveTitle(message.content, currentSessionId).catch(err => {
           console.error("Error generating title:", err);
           // Optionally update title to "Chat" or something generic if generation fails
         });
      }

      return { messageId: messageData.id, sessionId: currentSessionId };
    } catch (error) {
      console.error('Error saving message/session:', error);
      toast.error('Failed to save message.');
      return { messageId: null, sessionId: sessionId }; 
    }
  };

  // --- New Function: Generate and Save Title ---
  const generateAndSaveTitle = async (firstMessageContent: string, sessionId: string) => {
    if (!aiSettings?.google_gemini_api_key || !user) {
      console.warn("Cannot generate title: Missing Gemini API key or user.");
      // Optionally update to a default title here if needed
      await supabase
        .from('chat_sessions')
        .update({ title: "Chat" })
        .eq('id', sessionId);
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: "Chat" } : s));
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(aiSettings.google_gemini_api_key);
      // Use the faster Flash model specifically for title generation
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); 

      const prompt = `Summarize the following user query into a concise chat title (3-5 words maximum):

"${firstMessageContent}"

Title:`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      let generatedTitle = response.text().trim().replace(/^"|"$/g, ''); // Remove surrounding quotes if any

      // Basic validation/fallback for title
      if (!generatedTitle || generatedTitle.length > 50) { // Keep titles reasonably short
        generatedTitle = firstMessageContent.substring(0, 40) + (firstMessageContent.length > 40 ? '...' : '');
      }
      
       if (!generatedTitle) { // Final fallback
           generatedTitle = "Chat Session";
       }


      // Update Supabase
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update({ title: generatedTitle })
        .eq('id', sessionId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title: generatedTitle } : s
      ));

    } catch (error) {
      console.error("Error generating or saving chat title:", error);
      // Consider updating to a generic title on error as well
      try {
        const fallbackTitle = firstMessageContent.substring(0, 40) + (firstMessageContent.length > 40 ? '...' : '') || "Chat";
        await supabase
            .from('chat_sessions')
            .update({ title: fallbackTitle })
            .eq('id', sessionId);
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: fallbackTitle } : s));
      } catch (fallbackError) {
         console.error("Error setting fallback title:", fallbackError);
      }
    }
  };
  // --- End New Function ---

  // Update the uploadFile function to handle missing bucket more gracefully
  const uploadFile = async (file: File): Promise<string> => {
    if (!user || !file) throw new Error("User not authenticated or no file selected");
    
    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        if (error.message.includes('The resource was not found') || 
            error.message.includes('does not exist')) {
          throw new Error('The storage bucket is not configured. Please contact your administrator.');
        }
        throw error;
      }
      
      // Get public URL of the file
      const { data: { publicUrl } } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // Function to handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  // Function to clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Function to call the selected AI
  const getAiResponse = async (history: Message[], userMessage: Message): Promise<string> => {
      if (!aiSettings || isLoadingSettings) {
          return "AI configuration is loading or missing. Please wait or contact support.";
      }

      const provider = aiSettings.default_ai_provider || 'openai'; // Default to openai if not set
      const recentHistory = history.slice(-10); // Limit history to last 10 messages for context

      try {
          if (provider === 'openai') {
              if (!aiSettings.openai_api_key) return "OpenAI API Key is missing.";
              
              const openai = new OpenAI({ apiKey: aiSettings.openai_api_key, dangerouslyAllowBrowser: true });
              const chatCompletion = await openai.chat.completions.create({
                  model: "gpt-3.5-turbo", // Or choose another model
                  messages: [
                      { role: "system", content: "You are Incorpify AI, a helpful assistant specializing in business incorporation and related services in the UAE and globally." }, 
                      ...recentHistory.map(m => ({ role: m.role, content: m.content })),
                      { role: "user", content: userMessage.content },
                  ],
              });
              console.log("OpenAI Raw Response:", chatCompletion);
              return chatCompletion.choices[0]?.message?.content || "No response from OpenAI.";
          
          } else if (provider === 'gemini') {
              if (!aiSettings.google_gemini_api_key) return "Google Gemini API Key is missing.";

              const genAI = new GoogleGenerativeAI(aiSettings.google_gemini_api_key);
              const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"}); 
              
              // --- Prepare history for Gemini --- 
              // Ensure history starts with 'user' and alternates correctly.
              let geminiHistory = [];
              const firstUserIndex = recentHistory.findIndex(m => m.role === 'user');
              
              if (firstUserIndex !== -1) {
                  // Slice history starting from the first user message
                  const validHistorySlice = recentHistory.slice(firstUserIndex);
                  
                  geminiHistory = validHistorySlice.map(m => ({
                      role: m.role === 'assistant' ? 'model' : 'user',
                      parts: [{ text: m.content }],
                  }));
                  
                  // Basic validation/correction for alternation (optional but safer)
                  // If the first role is somehow 'model', remove it (shouldn't happen with slice but belt-and-suspenders)
                  if (geminiHistory.length > 0 && geminiHistory[0].role === 'model') {
                      geminiHistory.shift(); 
                  }
                  // Note: More complex alternation checks could be added if needed, but starting with user is key.
              }
              // --- End Prepare history ---
              
              const chat = model.startChat({
                  history: geminiHistory, // Use the processed history
                  generationConfig: {
                      maxOutputTokens: 1000, // Adjust as needed
                  },
              });

              const result = await chat.sendMessage(userMessage.content);
              console.log("Gemini Raw Result:", result);
              const response = result.response;
              console.log("Gemini Parsed Response:", response);
              return response.text();
          }
      } catch (error: any) { 
          console.error(`Error calling ${provider} API:`, error);
          console.log("AI API Error Object:", error); 
          return `Sorry, I encountered an error trying to reach the ${provider} AI. Please try again later. Details: ${error.message || error}`;
      }

      return "Selected AI provider is not configured.";
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering loadChatSession

    if (!user) return;

    // Optional: Add a confirmation dialog
    if (!window.confirm('Are you sure you want to delete this chat session and all its messages?')) {
      return;
    }

    try {
      // 1. Delete messages associated with the session
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId);

      if (messagesError) throw messagesError;

      // 2. Delete the session itself
      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id); // Ensure user owns the session

      if (sessionError) throw sessionError;

      // 3. Update UI state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If the deleted session was active, clear the chat area
      if (activeSession === sessionId) {
        setActiveSession(null);
        setMessages([
          {
            role: 'assistant',
            content: 'Chat session deleted. Start a new chat or select another from the history.',
            timestamp: new Date()
          }
        ]);
      }

      toast.success('Chat session deleted.');

    } catch (error: any) {
      console.error('Error deleting chat session:', error);
      toast.error(`Failed to delete session: ${error.message}`);
    }
  };

  // Modified handleSendMessage to include file attachment
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!input.trim() && !selectedFile) || loading || isLoadingSettings) return;
    if (!aiSettings || (!aiSettings.openai_api_key && !aiSettings.google_gemini_api_key)) {
        toast.error('AI is not configured. Please add API keys in Admin > AI Settings.');
        return;
    }
    
    setLoading(true);
    
    try {
      let attachmentUrl = "";
      let attachmentType = "";
      let attachmentName = "";
      
      // Upload file if selected
      if (selectedFile) {
        setIsUploading(true);
        try {
          attachmentUrl = await uploadFile(selectedFile);
          attachmentType = selectedFile.type;
          attachmentName = selectedFile.name;
        } catch (error: any) {
          console.error("Error uploading file:", error);
          // Better error messages based on the error type
          if (error.message?.includes('storage bucket is not configured')) {
            toast.error("File storage not configured. Please contact the administrator.");
          } else if (error.message?.includes('row-level security policy')) {
            toast.error("Permission denied. You don't have access to upload files.");
          } else if (error.message?.includes('size exceeds')) {
            toast.error("File is too large. Please upload a smaller file.");
          } else {
            toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
          }
          
          // Continue with just the text if we have some
          if (!input.trim()) {
            setLoading(false);
            setIsUploading(false);
            return;
          }
          
          // If we have text, continue without attachment
          setIsUploading(false);
        } finally {
          setIsUploading(false);
        }
      }
      
      const contentText = input.trim() || (selectedFile && attachmentUrl ? `Sent ${selectedFile.name}` : "");
      
      // If we have no content after trying to handle attachments, abort
      if (!contentText) {
        setLoading(false);
        return;
      }
      
      // Create user message with attachment info (only if upload succeeded)
      const userMessage: Message = {
        role: 'user',
        content: contentText,
        timestamp: new Date(),
        attachment_url: attachmentUrl || undefined,
        attachment_type: attachmentType || undefined,
        attachment_name: attachmentName || undefined
      };
      
      const currentMessages = [...messages, userMessage];
      setMessages(currentMessages);
      setInput('');
      clearSelectedFile();
      inputRef.current?.focus();
      
      const { sessionId: currentSessionId } = await saveMessage(userMessage, activeSession);
      
      // Get AI response
      try {
        // For now, just pass the text content to the AI, not the attachment
        const aiContent = await getAiResponse(currentMessages, userMessage);
        
        const aiResponse: Message = {
          role: 'assistant',
          content: aiContent,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponse]);
        
        if (currentSessionId) {
          await saveMessage(aiResponse, currentSessionId);
        }
      } catch (error) { 
        const errorResponse: Message = {
          role: 'assistant',
          content: "Sorry, I couldn't process your request due to an internal error.",
          timestamp: new Date()
        };
         setMessages(prev => [...prev, errorResponse]);
         if (currentSessionId) {
           await saveMessage(errorResponse, currentSessionId);
         }
      }
    } catch (error: any) {
      console.error("Error in message handling:", error);
      toast.error(`Failed to send message: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] flex flex-col">
        <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'} mb-4`}>AI Assistant</h1>
        
        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
          {/* Chat sessions sidebar - hidden on mobile */}
          <div className={`hidden md:flex flex-col w-64 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1A1A1A] border-[#2F2F2F]'} border rounded-lg overflow-hidden`}>
            <div className={`p-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-[#2F2F2F]'} flex justify-between items-center`}>
              <h2 className={`font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Chat History</h2>
              <Button variant="ghost" size="icon" className={`${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} hover:bg-gray-700/50`} onClick={createNewSession} title="New Chat">
                <Plus size={18} />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoadingHistory ? (
                <div className="text-center p-4 text-gray-400">Loading history...</div>
              ) : (
                <>
                  {/* Render pending new chat item if active */}
                  {isNewChatPending && (
                    <div className={`w-full text-left px-3 py-2 rounded-md text-sm truncate ${ 
                      theme === 'light' ? 'bg-purple-100 text-purple-800 font-medium' : 'bg-purple-900/30 text-purple-200 font-medium'
                    }`}>
                      New Chat...
                      {/* Optional: Add a subtle loading indicator? */}
                    </div>
                  )}
                  {/* Render existing sessions */}
                  {sessions.map(session => (
                    <div key={session.id} className="relative group">
                      <button 
                        onClick={() => loadChatSession(session.id)}
                        // Deactivate active style if isNewChatPending is true
                        className={`w-full text-left pl-3 pr-8 py-2 rounded-md text-sm truncate ${ 
                          !isNewChatPending && activeSession === session.id // Only active if not pending new chat
                            ? (theme === 'light' ? 'bg-purple-100 text-purple-800 font-medium' : 'bg-purple-900/30 text-purple-200 font-medium')
                            : (theme === 'light' ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-700/50')
                        }`}
                        title={session.title}
                      >
                        {session.title}
                        <span className={`block text-xs ${!isNewChatPending && activeSession === session.id ? (theme === 'light' ? 'text-purple-600' : 'text-purple-400') : (theme === 'light' ? 'text-gray-400' : 'text-gray-500')}`}>
                          {formatSessionDate(session.updated_at)}
                        </span>
                      </button>
                      <Button 
                        variant="ghost"
                        size="icon"
                        className={`absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 ${theme === 'light' ? 'text-red-500 hover:bg-red-100' : 'text-red-400 hover:bg-red-900/50'}`}
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        title="Delete Chat"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </>
              )}
              {sessions.length === 0 && !isLoadingHistory && (
                <div className="text-center p-4 text-gray-400 text-sm">No chat history yet.</div>
              )}
            </div>
          </div>
          
          {/* Main chat area */}
          <Card className={`flex-1 flex flex-col overflow-hidden ${theme === 'light' ? 'bg-white' : 'bg-[#1A1A1A]'} border ${theme === 'light' ? 'border-gray-200' : 'border-[#2F2F2F]'}`}>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {message.role === 'assistant' && (
                       <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
                        <Bot size={18} className={`${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`} />
                      </div>
                    )}
                    {message.role === 'user' && (
                       <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                        <User size={18} className={`${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                      </div>
                    )}
                    <div className={`px-4 py-2 rounded-lg ${ 
                      message.role === 'user' 
                        ? (theme === 'light' ? 'bg-blue-500 text-white' : 'bg-blue-700 text-white') 
                        : (theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-[#2F2F2F] text-gray-200')
                    }`}>
                      <div className={`prose prose-sm max-w-none ${ 
                        message.role === 'user' 
                          ? 'prose-invert' 
                          : (theme === 'light' ? '' : 'prose-invert')
                      }`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]} 
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline"/>,
                            code({node, inline, className, children, ...props}: {
                              node?: any;
                              inline?: boolean;
                              className?: string;
                              children?: React.ReactNode;
                            }) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <div className="my-2 overflow-auto rounded bg-black/80 p-3 font-mono text-xs text-white">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </div>
                              ) : (
                                <code className={`before:content-none after:content-none ${theme === 'light' ? 'bg-gray-200 text-gray-700' : 'bg-gray-600 text-gray-100'} rounded px-1 py-0.5 font-mono text-xs`} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            ul: ({node, ...props}) => <ul className="list-disc list-inside" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className={`border-l-4 ${theme === 'light' ? 'border-gray-300' : 'border-gray-600'} pl-4 italic my-2`} {...props} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      
                      {/* Display attachment if present */}
                      {message.attachment_url && (
                        <div className="mt-2 rounded overflow-hidden border border-gray-600">
                          {message.attachment_type?.startsWith('image/') ? (
                            // Image attachment
                            <div>
                              <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="block">
                                <img 
                                  src={message.attachment_url} 
                                  alt={message.attachment_name || "Image attachment"} 
                                  className="max-w-full max-h-[200px] object-contain" 
                                />
                              </a>
                              <div className={`flex justify-between items-center p-2 text-xs ${
                                message.role === 'user' ? 'bg-blue-600' : (theme === 'light' ? 'bg-gray-200' : 'bg-gray-700')
                              }`}>
                                <span className="truncate max-w-[70%]">{message.attachment_name}</span>
                                <a 
                                  href={message.attachment_url} 
                                  download={message.attachment_name}
                                  className="flex items-center gap-1 hover:underline"
                                  target="_blank" rel="noopener noreferrer"
                                >
                                  <Download size={12} />
                                  Download
                                </a>
                              </div>
                            </div>
                          ) : message.attachment_type?.includes('pdf') ? (
                            // PDF attachment
                            <div className={`flex items-center gap-2 p-2 ${
                              message.role === 'user' ? 'bg-blue-600' : (theme === 'light' ? 'bg-gray-200' : 'bg-gray-700')
                            }`}>
                              <FileText size={20} />
                              <div className="flex-1 truncate">
                                <a 
                                  href={message.attachment_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:underline text-sm"
                                >
                                  {message.attachment_name}
                                </a>
                              </div>
                              <a 
                                href={message.attachment_url} 
                                download={message.attachment_name}
                                className="flex items-center gap-1 hover:underline text-xs"
                                target="_blank" rel="noopener noreferrer"
                              >
                                <Download size={12} />
                                Download
                              </a>
                            </div>
                          ) : (
                            // Other file types
                            <div className={`flex items-center gap-2 p-2 ${
                              message.role === 'user' ? 'bg-blue-600' : (theme === 'light' ? 'bg-gray-200' : 'bg-gray-700')
                            }`}>
                              <FileText size={20} />
                              <div className="flex-1 truncate">
                                <a 
                                  href={message.attachment_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:underline text-sm"
                                >
                                  {message.attachment_name}
                                </a>
                              </div>
                              <a 
                                href={message.attachment_url} 
                                download={message.attachment_name}
                                className="flex items-center gap-1 hover:underline text-xs"
                                target="_blank" rel="noopener noreferrer"
                              >
                                <Download size={12} />
                                Download
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <span className={`text-xs mt-1 flex items-center gap-1 ${ 
                        message.role === 'user'
                          ? (theme === 'light' ? 'text-blue-100' : 'text-blue-300') 
                          : (theme === 'light' ? 'text-gray-500' : 'text-gray-400')
                      }`}>
                        <Clock size={12} />
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-purple-100' : 'bg-purple-900/30'}`}>
                      <Bot size={18} className={`${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`} />
                    </div>
                    <div className={`px-4 py-2 rounded-lg ${theme === 'light' ? 'bg-gray-100' : 'bg-[#2F2F2F]'}`}>
                      <div className="flex space-x-1">
                        <span className={`h-2 w-2 ${theme === 'light' ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce [animation-delay:-0.3s]`}></span>
                        <span className={`h-2 w-2 ${theme === 'light' ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce [animation-delay:-0.15s]`}></span>
                        <span className={`h-2 w-2 ${theme === 'light' ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`}></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            
            {/* Message Input */}
            <div className={`p-4 border-t ${theme === 'light' ? 'border-gray-200' : 'border-[#2F2F2F]'}`}>
              {/* Selected file preview */}
              {selectedFile && (
                <div className={`mb-2 p-2 rounded flex items-center gap-2 ${
                  theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-gray-800 text-gray-200'
                }`}>
                  {selectedFile.type.startsWith('image/') ? <Image size={16} /> : <FileText size={16} />}
                  <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSelectedFile}
                    className={`h-6 w-6 p-0 rounded-full ${
                      theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700'
                    }`}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading || isLoadingSettings || !aiSettings}
                    className={`flex-1 pr-10 ${
                      theme === 'light' ? 'bg-white border-gray-300' : 'bg-[#2F2F2F] border-[#4A4A4A] text-white'
                    }`}
                  />
                  
                  {/* File attachment button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || isUploading || isLoadingSettings || !aiSettings}
                    title="Attach file"
                  >
                    <Paperclip size={16} className={`${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    } ${
                      (loading || isUploading || isLoadingSettings || !aiSettings) ? 'opacity-50' : 'opacity-100'
                    }`} />
                  </Button>
                  
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.txt,.doc,.docx,.xlsx,.csv"
                    disabled={loading || isUploading || isLoadingSettings || !aiSettings}
                  />
                </div>
                
                <Button 
                  type="submit"
                  disabled={
                    loading || 
                    isUploading || 
                    isLoadingSettings || 
                    !aiSettings || 
                    (!input.trim() && !selectedFile)
                  } 
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  {loading || isUploading ? (
                    <div className="flex items-center gap-1">
                      <div className="animate-spin h-4 w-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <span className="text-xs">{isUploading ? 'Uploading...' : 'Sending...'}</span>
                    </div>
                  ) : (
                    <Send size={18} />
                  )}
                </Button>
              </form>
              
              {(!aiSettings && !isLoadingSettings) && (
                <p className="text-xs text-red-500 mt-2">
                  AI Chat is disabled. Please configure API keys in the admin settings.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AiChatPage; 