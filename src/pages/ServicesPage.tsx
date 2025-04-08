import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, 
  BarChart, 
  Briefcase, 
  Clock, 
  FileCheck, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import supabase from '../lib/supabase';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  features: string[];
  price: string;
}

interface ServiceRequest {
  id: string;
  service_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
  details: Record<string, any>;
}

const ServicesPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeRequests, setActiveRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    const fetchServiceRequests = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('service_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          setActiveRequests(data);
        }
      } catch (error) {
        console.error('Error fetching service requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceRequests();
  }, [user]);

  const services: Service[] = [
    {
      id: 'incorporation',
      title: 'Business Incorporation',
      description: 'Set up your business entity in the UAE with our comprehensive incorporation service.',
      icon: <Building size={24} />,
      path: '/dashboard/services/incorporation',
      color: 'from-[#8e53e5] to-[#3b00eb]',
      features: [
        'Mainland, Free Zone, or Offshore company formation',
        'Trade license application and processing',
        'Legal documentation preparation',
        'Corporate bank account assistance',
        'Visa processing support for owners and employees',
        'Corporate PRO services'
      ],
      price: ''
    },
    {
      id: 'tax',
      title: 'Tax & VAT Services',
      description: 'Optimize your tax strategy and ensure compliance with UAE and international tax regulations.',
      icon: <BarChart size={24} />,
      path: '/dashboard/services/tax',
      color: 'from-[#8e53e5] to-[#3b00eb]',
      features: [
        'UAE Corporate Tax registration and compliance',
        'VAT registration and return filing',
        'Economic Substance Regulations (ESR) compliance',
        'Tax residency certificate application',
        'International tax planning',
        'Tax audit support'
      ],
      price: ''
    },
    {
      id: 'compliance',
      title: 'Business Compliance',
      description: 'Stay compliant with all UAE regulations and avoid penalties with our comprehensive compliance services.',
      icon: <Briefcase size={24} />,
      path: '/dashboard/services/compliance',
      color: 'from-[#8e53e5] to-[#3b00eb]',
      features: [
        'Annual license renewal',
        'Legal documentation management',
        'Ministry approvals and attestations',
        'Regulatory updates and compliance',
        'Commercial agency registration',
        'Ultimate Beneficial Owner (UBO) registration'
      ],
      price: ''
    },
  ];

  const getStatusBadge = (status: ServiceRequest['status']) => {
    const isLight = theme === 'light';
    
    switch (status) {
      case 'pending':
        return (
          <Badge className={isLight 
            ? "bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200"
            : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30"}>
            Pending
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className={isLight
            ? "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200"
            : "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30"}>
            In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge className={isLight
            ? "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200" 
            : "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30"}>
            Completed
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className={isLight
            ? "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200"
            : "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"}>
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getServiceById = (id: string) => {
    return services.find(service => service.id === id) || {
      title: 'Unknown Service',
      icon: <AlertTriangle size={24} />,
      color: 'from-gray-500 to-gray-700'
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'} mb-1`}>
            Services
          </h1>
          <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
            Explore our business services and manage your active requests.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={theme === 'light' 
            ? 'bg-white border border-gray-200' 
            : 'bg-[#1A1A1A] border border-[#2F2F2F]'}>
            <TabsTrigger 
              value="active" 
              className={theme === 'light'
                ? 'data-[state=active]:bg-purple-600 data-[state=active]:text-white'
                : 'data-[state=active]:bg-[#3B00EC] data-[state=active]:text-white'}>
              Active Requests
            </TabsTrigger>
            <TabsTrigger 
              value="all" 
              className={theme === 'light'
                ? 'data-[state=active]:bg-purple-600 data-[state=active]:text-white'
                : 'data-[state=active]:bg-[#3B00EC] data-[state=active]:text-white'}>
              All Services
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="pt-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className={`animate-spin rounded-full h-8 w-8 border-2 ${
                  theme === 'light' ? 'border-purple-500' : 'border-purple-300'
                }`}></div>
              </div>
            ) : activeRequests.length === 0 ? (
              <Card className={theme === 'light'
                ? 'bg-white border-gray-200 shadow-sm'
                : 'bg-[#1A1A1A] border-[#2F2F2F] text-white'}>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock size={48} className={`${theme === 'light' ? 'text-gray-400' : 'text-gray-400'} mb-4`} />
                  <h3 className={`text-xl font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'} mb-2`}>
                    No Active Requests
                  </h3>
                  <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} text-center max-w-md mb-6`}>
                    You don't have any active service requests. Browse our services and get started with your business needs.
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white"
                    onClick={() => setActiveTab("all")}
                  >
                    View Services
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeRequests.map((request) => {
                  const service = getServiceById(request.service_id);
                  return (
                    <Card key={request.id} className={theme === 'light'
                      ? 'bg-white border-gray-200 shadow-sm hover:border-gray-300 transition-colors'
                      : 'bg-[#1A1A1A] border-[#2F2F2F] text-white hover:border-gray-700 transition-colors'}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${service.color} text-white mr-4`}>
                              {service.icon}
                            </div>
                            <div>
                              <h3 className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                {service.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge(request.status)}
                                <span className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                  Requested on {formatDate(request.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            className={`group ${theme === 'light'
                              ? 'border border-gray-200 hover:bg-gray-50 text-gray-800'
                              : 'border border-[#2F2F2F] hover:bg-[#2F2F2F]/30 text-white'}`}
                            asChild
                          >
                            <Link to={`/dashboard/services/requests/${request.id}`} className="flex items-center">
                              View Details
                              <ChevronRight size={16} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="pt-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card key={service.id} className={theme === 'light'
                  ? 'bg-white border-gray-200 shadow-sm hover:border-purple-200 transition-all overflow-hidden'
                  : 'bg-[#1A1A1A] border-[#2F2F2F] text-white hover:border-[#3B00EC]/40 transition-all overflow-hidden'}>
                  <div className={`h-2 w-full bg-gradient-to-r ${service.color}`}></div>
                  <CardHeader>
                    <div className="flex items-center mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${service.color} text-white mr-3`}>
                        {service.icon}
                      </div>
                      <CardTitle className={theme === 'light' ? 'text-gray-800' : 'text-white'}>
                        {service.title}
                      </CardTitle>
                    </div>
                    <CardDescription className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mt-2">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <FileCheck className={`h-5 w-5 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'} mr-2 flex-shrink-0 mt-0.5`} />
                          <span className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch pt-4 border-t border-gray-200 dark:border-[#2F2F2F]">
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white"
                    >
                      <Link to={service.path}>
                        Request Consultation <ChevronRight size={16} className="ml-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ServicesPage; 