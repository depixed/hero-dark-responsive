import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Send, User, Bot, Clock, ArrowDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import supabase from '../lib/supabase';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting message
  useEffect(() => {
    if (messages.length === 0 && !activeSession) {
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I\'m your AI assistant from Incorpify. How can I help you with your business today?',
          timestamp: new Date()
        }
      ]);
    }
  }, [messages, activeSession]);

  // Load chat sessions
  useEffect(() => {
    const fetchChatSessions = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          setSessions(data);
        }
      } catch (error) {
        console.error('Error fetching chat sessions:', error);
      }
    };

    fetchChatSessions();
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatSession = async (sessionId: string) => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    
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
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const createNewSession = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant from Incorpify. How can I help you with your business today?',
        timestamp: new Date()
      }
    ]);
    setActiveSession(null);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const saveMessage = async (message: Message, sessionId: string | null) => {
    if (!user) return null;
    
    try {
      // If no active session, create one
      let currentSessionId = sessionId;
      
      if (!currentSessionId) {
        const sessionTitle = message.content.length > 30 
          ? `${message.content.substring(0, 30)}...` 
          : message.content;
          
        const { data: newSession, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert([
            { 
              user_id: user.id,
              title: sessionTitle,
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (sessionError) throw sessionError;
        
        currentSessionId = newSession.id;
        setActiveSession(currentSessionId);
        
        // Add the session to our sessions list
        setSessions(prev => [newSession, ...prev]);
      } else {
        // Update the timestamp on the existing session
        await supabase
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentSessionId);
          
        // Update the session list to reflect the change
        setSessions(prev => prev.map(session => 
          session.id === currentSessionId 
            ? { ...session, updated_at: new Date().toISOString() } 
            : session
        ));
      }
      
      // Save the message
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: currentSessionId,
            role: message.role,
            content: message.content,
            timestamp: message.timestamp.toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      return { messageId: data.id, sessionId: currentSessionId };
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;
    
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    // Save user message to database
    const savedMessage = await saveMessage(userMessage, activeSession);
    
    // Here we would normally call our AI service
    // For now, we'll simulate a response
    setTimeout(async () => {
      const aiResponse: Message = {
        role: 'assistant',
        content: `I'll help you with "${input}". This is a simulated response. In a real implementation, this would connect to an AI service like OpenAI or your custom model.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
      
      // Save AI response to database
      if (savedMessage) {
        await saveMessage(aiResponse, savedMessage.sessionId);
      }
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] flex flex-col">
        <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'} mb-4`}>AI Assistant</h1>
        
        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
          {/* Chat sessions sidebar - hidden on mobile */}
          <div className={`hidden md:flex flex-col w-64 ${
            theme === 'light' 
              ? 'bg-white border-gray-200' 
              : 'bg-[#1A1A1A] border-[#2F2F2F]'
            } border rounded-lg overflow-hidden`}>
            <div className={`p-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-[#2F2F2F]'}`}>
              <Button 
                onClick={createNewSession}
                className="w-full bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white"
              >
                New Chat
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {sessions.length === 0 ? (
                <div className={`text-center py-4 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                  No chat history yet
                </div>
              ) : (
                <div className="space-y-1">
                  {sessions.map(session => (
                    <button
                      key={session.id}
                      onClick={() => loadChatSession(session.id)}
                      className={`w-full text-left p-2 rounded-md flex items-center gap-2 ${
                        activeSession === session.id
                          ? theme === 'light'
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-[#2F2F2F] text-white'
                          : theme === 'light'
                            ? 'hover:bg-gray-50 text-gray-700'
                            : 'hover:bg-[#252525] text-gray-200'
                      }`}
                    >
                      <Clock size={14} className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'} />
                      <div className="flex-1 truncate">
                        <div className="truncate font-medium text-sm">
                          {session.title}
                        </div>
                        <div className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formatSessionDate(session.updated_at)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Main chat area */}
          <div className={`flex-1 flex flex-col ${
            theme === 'light' 
              ? 'bg-white border-gray-200' 
              : 'bg-[#1A1A1A] border-[#2F2F2F]'
            } border rounded-lg overflow-hidden`}>
            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingHistory ? (
                <div className="h-full flex items-center justify-center">
                  <div className={`w-8 h-8 border-t-2 ${
                    theme === 'light' 
                      ? 'border-purple-500' 
                      : 'border-[#8e53e5]'
                    } rounded-full animate-spin`}></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 flex ${
                          message.role === 'user'
                            ? 'bg-[#8e53e5] text-white ml-4'
                            : theme === 'light'
                              ? 'bg-gray-100 text-gray-800 mr-4'
                              : 'bg-[#252525] text-gray-100 mr-4'
                        }`}
                      >
                        <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                          message.role === 'user'
                            ? 'bg-[#7f43d6]'
                            : theme === 'light'
                              ? 'bg-gray-200'
                              : 'bg-[#353535]'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <User size={16} />
                          ) : (
                            <Bot size={16} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                          <div className={`text-xs mt-1 ${
                            message.role === 'user'
                              ? 'text-purple-200'
                              : theme === 'light'
                                ? 'text-gray-500'
                                : 'text-gray-400'
                            }`}
                          >
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Input area */}
            <div className={`p-4 border-t ${theme === 'light' ? 'border-gray-200' : 'border-[#2F2F2F]'}`}>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className={theme === 'light' 
                    ? 'border-gray-300 focus:border-purple-400 bg-white text-gray-800' 
                    : 'border-gray-700 focus:border-[#8e53e5] bg-[#252525] text-white'}
                  disabled={loading}
                />
                <Button 
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white"
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AiChatPage; 