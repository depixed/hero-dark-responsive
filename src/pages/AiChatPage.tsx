import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Send, User, Bot, Clock, ArrowDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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
        <h1 className="text-2xl font-bold text-white mb-4">AI Assistant</h1>
        
        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
          {/* Chat sessions sidebar - hidden on mobile */}
          <div className="hidden md:flex flex-col w-64 bg-[#1A1A1A] border border-[#2F2F2F] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[#2F2F2F]">
              <Button 
                onClick={createNewSession}
                className="w-full bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white"
              >
                New Chat
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="text-center p-4 text-gray-400">
                  No previous chats
                </div>
              ) : (
                <div className="divide-y divide-[#2F2F2F]">
                  {sessions.map(session => (
                    <button
                      key={session.id}
                      onClick={() => loadChatSession(session.id)}
                      className={`w-full text-left p-3 hover:bg-[#2F2F2F]/20 transition-colors ${
                        activeSession === session.id ? 'bg-[#2F2F2F]/30' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <Clock size={16} className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-sm text-white truncate">{session.title}</p>
                          <p className="text-xs text-gray-400">{formatSessionDate(session.updated_at)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Chat main area */}
          <Card className="flex-1 bg-[#1A1A1A] border-[#2F2F2F] text-white flex flex-col overflow-hidden">
            <CardHeader className="border-b border-[#2F2F2F] py-3 px-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {activeSession 
                    ? sessions.find(s => s.id === activeSession)?.title || 'Chat' 
                    : 'New Chat'}
                </CardTitle>
                
                {/* Mobile dropdown for session selection */}
                <div className="md:hidden">
                  <select 
                    value={activeSession || 'new'} 
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'new') {
                        createNewSession();
                      } else {
                        loadChatSession(value);
                      }
                    }}
                    className="bg-[#0F0F0F] border border-[#2F2F2F] text-white rounded-md p-1 text-sm"
                  >
                    <option value="new">New Chat</option>
                    {sessions.map(session => (
                      <option key={session.id} value={session.id}>
                        {session.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-0">
              {isLoadingHistory ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`flex max-w-[80%] ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <div 
                          className={`flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 ${
                            message.role === 'user' 
                              ? 'bg-[#3B00EC] ml-2' 
                              : 'bg-[#8e53e5] mr-2'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <User size={16} className="text-white" />
                          ) : (
                            <Bot size={16} className="text-white" />
                          )}
                        </div>
                        
                        <div>
                          <div 
                            className={`p-3 rounded-lg ${
                              message.role === 'user' 
                                ? 'bg-[#3B00EC]/20 border border-[#3B00EC]/30' 
                                : 'bg-[#2F2F2F]'
                            }`}
                          >
                            <p className="text-white whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <p className={`text-xs text-gray-400 mt-1 ${
                            message.role === 'user' ? 'text-right' : 'text-left'
                          }`}>
                            {formatTimestamp(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start">
                      <div className="flex max-w-[80%] flex-row">
                        <div className="bg-[#8e53e5] h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mr-2">
                          <Bot size={16} className="text-white" />
                        </div>
                        <div className="p-3 bg-[#2F2F2F] rounded-lg">
                          <div className="flex space-x-2">
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>
            
            <div className="p-4 border-t border-[#2F2F2F]">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-[#0F0F0F] border-[#2F2F2F] text-white h-12 rounded-lg px-4"
                  disabled={loading || isLoadingHistory}
                />
                <Button 
                  type="submit" 
                  className={`bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] ${
                    !input.trim() || loading || isLoadingHistory 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:from-[#7440c0] hover:to-[#3100c5]'
                  } h-12 w-12 rounded-lg flex items-center justify-center`}
                  disabled={!input.trim() || loading || isLoadingHistory}
                >
                  <Send size={20} className="text-white" />
                </Button>
              </form>
              
              {messages.length > 3 && (
                <button 
                  onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="absolute bottom-20 right-8 bg-[#2F2F2F] text-white p-2 rounded-full shadow-lg hover:bg-[#3F3F3F] transition-colors"
                >
                  <ArrowDown size={20} />
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AiChatPage; 