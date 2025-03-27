import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  FileText, 
  ChevronRight,
  Building,
  Briefcase,
  BarChart
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

interface ServiceCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

interface QuickStat {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  color: string;
}

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const [greeting, setGreeting] = useState<string>('');
  
  useEffect(() => {
    const hours = new Date().getHours();
    let greetingText = 'Good Evening';
    
    if (hours < 12) {
      greetingText = 'Good Morning';
    } else if (hours < 18) {
      greetingText = 'Good Afternoon';
    }
    
    setGreeting(greetingText);
  }, []);
  
  const services: ServiceCard[] = [
    {
      title: 'Business Incorporation',
      description: 'Set up your business entity the right way with our guided incorporation service.',
      icon: <Building size={24} />,
      path: '/dashboard/services/incorporation',
      color: 'from-[#8e53e5] to-[#3b00eb]',
    },
    {
      title: 'Tax Optimization',
      description: 'Optimize your tax strategy and save money with our personalized recommendations.',
      icon: <BarChart size={24} />,
      path: '/dashboard/services/tax',
      color: 'from-[#8e53e5] to-[#3b00eb]',
    },
    {
      title: 'Business Compliance',
      description: 'Stay compliant with all regulations and avoid costly penalties.',
      icon: <Briefcase size={24} />,
      path: '/dashboard/services/compliance',
      color: 'from-[#8e53e5] to-[#3b00eb]',
    },
  ];
  
  const quickStats: QuickStat[] = [
    {
      title: 'AI Chat',
      value: '24/7',
      icon: <MessageSquare size={24} />,
      description: 'Ask our AI assistant anything about your business needs.',
      color: 'from-[#8e53e5] to-[#3b00eb]',
    },
    {
      title: 'Documents',
      value: '0',
      icon: <FileText size={24} />,
      description: 'Your important business documents stored securely.',
      color: 'from-[#8e53e5] to-[#3b00eb]',
    },
  ];
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {greeting}, {profile?.full_name || user?.email?.split('@')[0] || 'there'}
          </h1>
          <p className="text-gray-400">
            Welcome to your Incorpify dashboard. Here's what's happening with your business.
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-[#1A1A1A] border-[#2F2F2F] text-white overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${stat.color} text-white`}>
                    {stat.icon}
                  </div>
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-medium text-white mb-1">{stat.title}</h3>
                {stat.description && (
                  <p className="text-sm text-gray-400">{stat.description}</p>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Link 
                  to={stat.title === 'AI Chat' ? '/dashboard/chat' : '/dashboard/documents'} 
                  className="text-[#8e53e5] text-sm hover:underline inline-flex items-center"
                >
                  Go to {stat.title.toLowerCase()}
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* Services */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Our Services</h2>
            <Link to="/dashboard/services" className="text-[#8e53e5] text-sm hover:underline">
              View all
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="bg-[#1A1A1A] border-[#2F2F2F] text-white">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${service.color} text-white mb-3`}>
                    {service.icon}
                  </div>
                  <CardTitle className="text-white">{service.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center border border-[#2F2F2F] text-white hover:bg-[#2F2F2F]/30"
                    asChild
                  >
                    <Link to={service.path}>Learn More</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        {/* AI Assistant Promotional Card */}
        <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-[#2F2F2F] text-white overflow-hidden">
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-6 flex-1">
              <h2 className="text-xl font-bold mb-2">Need Help With Your Business?</h2>
              <p className="text-gray-400 mb-4">
                Our AI assistant is available 24/7 to answer your questions and provide guidance
                on business formation, taxes, compliance, and more.
              </p>
              <Button 
                className="bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white"
                asChild
              >
                <Link to="/dashboard/chat">Chat with AI Assistant</Link>
              </Button>
            </div>
            <div className="bg-gradient-to-br from-[#3B00EC]/20 to-[#8e53e5]/20 p-8 flex-shrink-0 w-full md:w-auto">
              <div className="w-full md:w-48 h-48 flex items-center justify-center">
                <MessageSquare size={72} className="text-[#8e53e5]" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard; 