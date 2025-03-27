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
  const [activeRequests, setActiveRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

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
      description: 'Set up your business entity the right way with our guided incorporation service.',
      icon: <Building size={24} />,
      path: '/dashboard/services/incorporation',
      color: 'from-[#8e53e5] to-[#3b00eb]',
      features: [
        'Entity formation (LLC, C-Corp, S-Corp)',
        'EIN registration',
        'Operating agreement creation',
        'State filing and registration',
        'Registered agent service (1 year)'
      ],
      price: 'Starting at $299'
    },
    {
      id: 'tax',
      title: 'Tax Optimization',
      description: 'Optimize your tax strategy and save money with our personalized recommendations.',
      icon: <BarChart size={24} />,
      path: '/dashboard/services/tax',
      color: 'from-[#8e53e5] to-[#3b00eb]',
      features: [
        'Tax structure analysis',
        'Deduction optimization',
        'Quarterly tax planning',
        'Year-end tax preparation',
        'IRS correspondence handling'
      ],
      price: 'Starting at $199'
    },
    {
      id: 'compliance',
      title: 'Business Compliance',
      description: 'Stay compliant with all regulations and avoid costly penalties.',
      icon: <Briefcase size={24} />,
      path: '/dashboard/services/compliance',
      color: 'from-[#8e53e5] to-[#3b00eb]',
      features: [
        'Annual report filing',
        'Business license management',
        'Compliance calendar',
        'Regulatory updates',
        'Legal document review'
      ],
      price: 'Starting at $149'
    },
  ];

  const getStatusBadge = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30">
            Pending
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30">
            In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30">
            Completed
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30">
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
          <h1 className="text-2xl font-bold text-white mb-1">
            Services
          </h1>
          <p className="text-gray-400">
            Explore our business services and manage your active requests.
          </p>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-[#1A1A1A] border border-[#2F2F2F]">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#3B00EC] data-[state=active]:text-white">
              All Services
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-[#3B00EC] data-[state=active]:text-white">
              Active Requests
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="pt-4">
            <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
              {services.map((service) => (
                <Card key={service.id} className="bg-[#1A1A1A] border-[#2F2F2F] text-white h-full flex flex-col">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${service.color} text-white mb-3`}>
                      {service.icon}
                    </div>
                    <CardTitle className="text-white">{service.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-[#8e53e5] font-medium mb-2">{service.price}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <FileCheck size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white"
                      asChild
                    >
                      <Link to={service.path}>Get Started</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="active" className="pt-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : activeRequests.length === 0 ? (
              <Card className="bg-[#1A1A1A] border-[#2F2F2F] text-white">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock size={48} className="text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Active Requests</h3>
                  <p className="text-gray-400 text-center max-w-md mb-6">
                    You don't have any active service requests. Browse our services and get started with your business needs.
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white"
                    asChild
                  >
                    <Link to="#all">View Services</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeRequests.map((request) => {
                  const service = getServiceById(request.service_id);
                  return (
                    <Card key={request.id} className="bg-[#1A1A1A] border-[#2F2F2F] text-white">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center p-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${service.color} text-white mb-3 sm:mb-0 sm:mr-4 flex-shrink-0`}>
                          {service.icon}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                            <h3 className="text-lg font-medium text-white">{service.title}</h3>
                            {getStatusBadge(request.status)}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-400">
                            <Clock size={14} className="mr-1" />
                            <span>Requested on {formatDate(request.created_at)}</span>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          className="mt-4 sm:mt-0 sm:ml-4 border border-[#2F2F2F] text-white hover:bg-[#2F2F2F]/30 flex-shrink-0"
                          asChild
                        >
                          <Link to={`/dashboard/services/requests/${request.id}`} className="flex items-center">
                            View Details
                            <ChevronRight size={16} className="ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ServicesPage; 