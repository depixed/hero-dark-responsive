import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  ArrowRight, 
  CheckCircle, 
  Calendar, 
  User, 
  Building, 
  Plus, 
  Trash2, 
  Save,
  Image as ImageIcon,
  ChevronLeft,
  Database,
  FileText,
  Link as LinkIcon,
  Copy
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator 
} from '../ui/dropdown-menu';
import ProposalPreview from './ProposalPreview';
import supabase from '../../lib/supabase';
import { useToast } from '../ui/use-toast';

interface FeeItem {
  id: string;
  description: string;
  fee: string;
}

interface BusinessActivity {
  title: string;
  description: string;
}

interface Proposal {
  id: string;
  title: string;
  client: string;
  recipient: string;
  date: string;
  company_name: string;
  status: string;
  intro: string;
  services: string[];
  fees: FeeItem[];
  business_activity: BusinessActivity;
  timeline: string;
  disclaimer: string;
  terms_text: string;
  payment_link: string;
}

// Sample data from the proposal.tsx file
const sampleData = {
  companyName: "Incorpify AI Holdings Ltd",
  proposalTitle: "Mainland Dubai UAE - Saudi Arabia Tech License Proposal",
  date: "3rd March 2025",
  recipient: "Venkat Raghunand",
  company: "AION TECH",
  intro: "Incorpify AI Holdings LTD is pleased to offer its comprehensive incorporation services to facilitate the establishment of your business in Mainland Dubai jurisdiction and Saudi Arabia (Tech License) with full compliance and efficiency.",
  services: [
    "Company Registration - Processing of legal entity formation in DWTC FreeZone",
    "Document Preparation & Submission - Handling all required paperwork",
    "Government Liaison - Coordination with relevant authorities",
    "Business Licensing & Approvals - Assistance in obtaining necessary permits",
    "Corporate Compliance Guidance - Ensuring adherence to local regulations",
    "Add-on Compliance package - assistance with the bank account opening, corporate tax registration, accounting software, filing, etc."
  ],
  fees: [
    { id: '1', description: "DED License - Incorporation", fee: "AED 15,000" },
    { id: '2', description: "Establishment card", fee: "AED 950" },
    { id: '3', description: "Virtual Office - Ejari", fee: "AED 8,700 + VAT" },
    { id: '4', description: "Investor visa (*Only one investor visa)", fee: "AED 4,350" },
    { id: '5', description: "Professional fee for execution", fee: "AED 25,000 + VAT" },
    { id: '6', description: "Saudi Arabia Tech License via VMS Sponsor", fee: "AED 60,000" },
    { id: '7', description: "Professional fee for execution", fee: "AED 30,000" },
    { id: '8', description: "Family & Friends Discount", fee: "AED 20,000" }
  ],
  businessActivity: {
    title: "Management Consultancies",
    description: "Includes providing consultancies and studies to help improving the organizations' performance, through analyzing the existing organizational problems and the development of plans for improvement, it involves procedural engineering, laying out flow-charts and related documents circulation, internal policy formulation, organizational restructuring, strategic plans development."
  },
  timeline: "The entire process including visa + establishment card takes 2-3 weeks for UAE and 1 to 2 months for Saudi Arabia depending on your cooperation.",
  disclaimer: "Kindly be advised that regulations, fees, and approvals are subject to change at the discretion of the governing authority.",
  termsText: "This offer is valid until 10th March 2025. Upon confirmation, our team will initiate the incorporation process and provide continuous support throughout the setup.",
  paymentLink: ""
};

const ProposalEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState('general');
  const [showPreview, setShowPreview] = useState(false);
  
  const [companyName, setCompanyName] = useState('');
  const [proposalTitle, setProposalTitle] = useState('Untitled Proposal');
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [recipient, setRecipient] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('Draft');
  const [paymentLink, setPaymentLink] = useState('');
  
  const [intro, setIntro] = useState('');
  
  const [services, setServices] = useState<string[]>([]);
  
  const [fees, setFees] = useState<FeeItem[]>([]);
  
  const [businessActivity, setBusinessActivity] = useState<BusinessActivity>({
    title: '',
    description: ''
  });
  
  const [timeline, setTimeline] = useState('');
  const [disclaimer, setDisclaimer] = useState('');
  const [termsText, setTermsText] = useState('');

  useEffect(() => {
    // If there's an ID, fetch the proposal
    if (id) {
      fetchProposal(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchProposal = async (proposalId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Populate form with fetched data
        setCompanyName(data.company_name || '');
        setProposalTitle(data.title || 'Untitled Proposal');
        setDate(new Date(data.date).toLocaleDateString());
        setRecipient(data.recipient || '');
        setCompany(data.client || '');
        setStatus(data.status || 'Draft');
        setIntro(data.intro || '');
        
        // Handle services array
        if (data.services && Array.isArray(data.services)) {
          setServices(data.services);
        }
        
        // Handle fees array
        if (data.fees && Array.isArray(data.fees)) {
          setFees(data.fees);
        } else {
          setFees([]);
        }
        
        // Handle business activity object
        if (data.business_activity) {
          setBusinessActivity({
            title: data.business_activity.title || '',
            description: data.business_activity.description || ''
          });
        }
        
        setTimeline(data.timeline || '');
        setDisclaimer(data.disclaimer || '');
        setTermsText(data.terms_text || '');
        setPaymentLink(data.payment_link || '');
      }
    } catch (error) {
      console.error('Error fetching proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to load proposal data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load sample data
  const loadSampleData = () => {
    setCompanyName(sampleData.companyName);
    setProposalTitle(sampleData.proposalTitle);
    setDate(sampleData.date);
    setRecipient(sampleData.recipient);
    setCompany(sampleData.company);
    setIntro(sampleData.intro);
    setServices(sampleData.services);
    setFees(sampleData.fees);
    setBusinessActivity(sampleData.businessActivity);
    setTimeline(sampleData.timeline);
    setDisclaimer(sampleData.disclaimer);
    setTermsText(sampleData.termsText);
    setPaymentLink(sampleData.paymentLink);
    
    toast({
      title: 'Sample Data Loaded',
      description: 'The proposal has been filled with sample data.',
    });
  };

  // Show a message for the load from leads feature
  const loadFromLeads = () => {
    toast({
      title: 'Coming Soon',
      description: 'Loading data from leads will be implemented in a future update.',
    });
  };
  
  // Calculate total fees
  const calculateTotal = () => {
    let total = 0;
    fees.forEach(item => {
      const value = item.fee.replace('AED', '').replace(/[+\s].*$/g, '').trim();
      const numericValue = parseFloat(value.replace(/,/g, ''));
      if (!isNaN(numericValue)) {
        total += numericValue;
      }
    });
    return `AED ${total.toLocaleString()}`;
  };
  
  // Add new service
  const addService = () => {
    setServices([...services, '']);
  };
  
  // Remove service
  const removeService = (index: number) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    setServices(updatedServices);
  };
  
  // Update service
  const updateService = (index: number, value: string) => {
    const updatedServices = [...services];
    updatedServices[index] = value;
    setServices(updatedServices);
  };
  
  // Add new fee
  const addFee = () => {
    const newId = Date.now().toString();
    setFees([...fees, { id: newId, description: '', fee: '' }]);
  };
  
  // Remove fee
  const removeFee = (id: string) => {
    setFees(fees.filter(fee => fee.id !== id));
  };
  
  // Update fee item
  const updateFeeItem = (id: string, field: 'description' | 'fee', value: string) => {
    setFees(fees.map(fee => 
      fee.id === id ? { ...fee, [field]: value } : fee
    ));
  };
  
  // Create a preview function
  const handlePreview = () => {
    setShowPreview(true);
  };
  
  // Save the proposal
  const handleSave = async () => {
    setSaving(true);
    try {
      const proposalData = {
        title: proposalTitle,
        client: company,
        recipient: recipient,
        date: new Date().toISOString(),
        company_name: companyName,
        status: status,
        intro: intro,
        services: services,
        fees: fees,
        business_activity: businessActivity,
        timeline: timeline,
        disclaimer: disclaimer,
        terms_text: termsText,
        payment_link: paymentLink,
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (id) {
        // Update existing proposal
        const { data, error } = await supabase
          .from('proposals')
          .update(proposalData)
          .eq('id', id)
          .select();
          
        if (error) throw error;
        result = data;
      } else {
        // Create new proposal
        const { data, error } = await supabase
          .from('proposals')
          .insert([proposalData])
          .select();
          
        if (error) throw error;
        result = data;
      }
      
      toast({
        title: 'Success',
        description: `Proposal ${id ? 'updated' : 'created'} successfully.`,
      });
      
      // Navigate back to proposals list
      navigate('/admin/proposals');
      
    } catch (error) {
      console.error('Error saving proposal:', error);
      toast({
        title: 'Error',
        description: `Failed to ${id ? 'update' : 'create'} proposal. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Generate and copy shareable link
  const copyShareableLink = () => {
    if (!id) {
      toast({
        title: 'Error',
        description: 'Please save the proposal first to generate a shareable link.',
        variant: 'destructive',
      });
      return;
    }

    const baseUrl = window.location.origin;
    const shareableUrl = `${baseUrl}/proposals/${id}`;
    
    // Direct approach - use the Clipboard API with fallback
    try {
      // Simple but effective approach
      const el = document.createElement('textarea');
      el.value = shareableUrl;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      
      // Select the text field
      el.select();
      
      // Copy the text
      document.execCommand('copy');
      
      // Remove the element
      document.body.removeChild(el);
      
      // Create a direct visual feedback on the button
      const copyButton = document.querySelector('.editor-copy-button');
      if (copyButton) {
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        
        setTimeout(() => {
          copyButton.innerHTML = originalText;
        }, 2000);
      }
      
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (err) {
      console.error('Could not copy text: ', err);
      
      // Show fallback alert with the URL
      toast({
        title: "Copy failed",
        description: "Please copy this URL manually: " + shareableUrl,
        variant: "destructive",
      });
      
      // Select the text for easier manual copying
      const urlDisplay = document.querySelector('.editor-url-display');
      if (urlDisplay) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(urlDisplay);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-white">Loading proposal data...</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {showPreview && (
          <ProposalPreview
            companyName={companyName}
            proposalTitle={proposalTitle}
            date={date}
            recipient={recipient}
            company={company}
            intro={intro}
            services={services}
            fees={fees}
            businessActivity={businessActivity}
            timeline={timeline}
            disclaimer={disclaimer}
            termsText={termsText}
            onClose={() => setShowPreview(false)}
          />
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white"
              onClick={() => navigate('/admin/proposals')}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Proposals
            </Button>
            
            {id && (
              <div className="flex items-center ml-2">
                <div className="bg-gray-800 text-gray-300 text-xs rounded-l px-3 py-1.5 border border-gray-700 border-r-0 max-w-xs truncate editor-url-display">
                  {`${window.location.origin}/proposals/${id}`}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-gray-800 rounded-l-none rounded-r text-gray-300 hover:text-gray-100 border border-gray-700 border-l-0 h-[30px] px-2 editor-copy-button"
                  onClick={copyShareableLink}
                  title="Copy shareable link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  <Database className="h-4 w-4 mr-2" />
                  Load Data
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuItem 
                  className="text-gray-300 focus:bg-gray-700 focus:text-white cursor-pointer flex items-center"
                  onClick={loadSampleData}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Load Sample Data
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem 
                  className="text-gray-300 focus:bg-gray-700 focus:text-white cursor-pointer flex items-center"
                  onClick={loadFromLeads}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Load from Leads
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              className="border-purple-600 text-purple-500 hover:bg-purple-700 hover:text-white"
              onClick={handlePreview}
            >
              Preview
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center">
                  <span className="mr-2">Saving...</span>
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Proposal
                </>
              )}
            </Button>
          </div>
        </div>
        
        <Card className="bg-gray-900 border-0 text-white">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-xl text-white">Edit Proposal</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 bg-gray-800 border-0 rounded-none">
                <TabsTrigger value="general" className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white border-0">General</TabsTrigger>
                <TabsTrigger value="services" className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white border-0">Services</TabsTrigger>
                <TabsTrigger value="fees" className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white border-0">Fees</TabsTrigger>
                <TabsTrigger value="activity" className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white border-0">Business Activity</TabsTrigger>
                <TabsTrigger value="terms" className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white border-0">Terms & Timeline</TabsTrigger>
              </TabsList>
              
              {/* General Tab */}
              <TabsContent value="general" className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="company-name" className="text-gray-300">Company Name</Label>
                    <Input 
                      id="company-name" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)} 
                      className="bg-gray-800 border-gray-700 mt-1 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="proposal-title" className="text-gray-300">Proposal Title</Label>
                    <Input 
                      id="proposal-title" 
                      value={proposalTitle} 
                      onChange={(e) => setProposalTitle(e.target.value)} 
                      className="bg-gray-800 border-gray-700 mt-1 text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="date" className="text-gray-300">Date</Label>
                    <Input 
                      id="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      className="bg-gray-800 border-gray-700 mt-1 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipient" className="text-gray-300">Recipient Name</Label>
                    <Input 
                      id="recipient" 
                      value={recipient} 
                      onChange={(e) => setRecipient(e.target.value)} 
                      className="bg-gray-800 border-gray-700 mt-1 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company" className="text-gray-300">Client Company</Label>
                    <Input 
                      id="company" 
                      value={company} 
                      onChange={(e) => setCompany(e.target.value)} 
                      className="bg-gray-800 border-gray-700 mt-1 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="intro" className="text-gray-300">Introduction</Label>
                  <Textarea 
                    id="intro" 
                    value={intro} 
                    onChange={(e) => setIntro(e.target.value)} 
                    className="bg-gray-800 border-gray-700 mt-1 h-32 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-300">Company Logo</Label>
                  <div className="mt-2 p-4 border border-gray-700 rounded-lg flex flex-col items-center justify-center text-center bg-gray-800">
                    <img 
                      src="/incorpify-logocolor.png" 
                      alt="Incorpify Logo" 
                      className="h-12 object-contain" 
                    />
                    <p className="text-sm text-gray-400 mt-2">Incorpify logo will be used in all proposals</p>
                  </div>
                </div>
              </TabsContent>
              
              {/* Services Tab */}
              <TabsContent value="services" className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-gray-300">Services Offered</Label>
                    <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800" onClick={addService}>
                      <Plus className="h-4 w-4 mr-1" /> Add Service
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {services.map((service, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Textarea 
                          value={service} 
                          onChange={(e) => updateService(index, e.target.value)} 
                          className="bg-gray-800 border-gray-700 flex-1 text-white"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-400 hover:bg-red-950/30"
                          onClick={() => removeService(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Fees Tab */}
              <TabsContent value="fees" className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-gray-300">Fee Structure</Label>
                    <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800" onClick={addFee}>
                      <Plus className="h-4 w-4 mr-1" /> Add Fee Item
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto rounded-lg">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-800">
                          <th className="p-3 text-left font-semibold text-gray-400">Description</th>
                          <th className="p-3 text-left font-semibold text-gray-400">Fee</th>
                          <th className="p-3 text-right font-semibold text-gray-400 w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fees.map((item) => (
                          <tr key={item.id} className="border-t border-gray-800">
                            <td className="p-3">
                              <Input 
                                value={item.description} 
                                onChange={(e) => updateFeeItem(item.id, 'description', e.target.value)} 
                                className="bg-gray-800 border-gray-700 text-white"
                              />
                            </td>
                            <td className="p-3">
                              <Input 
                                value={item.fee} 
                                onChange={(e) => updateFeeItem(item.id, 'fee', e.target.value)} 
                                className="bg-gray-800 border-gray-700 text-white"
                              />
                            </td>
                            <td className="p-3 text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:text-red-400 hover:bg-red-950/30"
                                onClick={() => removeFee(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-gray-800 bg-gray-800/50">
                          <td className="p-3 font-bold">TOTAL</td>
                          <td className="p-3 font-bold text-blue-400">{calculateTotal()}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              
              {/* Business Activity Tab */}
              <TabsContent value="activity" className="p-6 space-y-6">
                <div>
                  <Label htmlFor="activity-title" className="text-gray-300">Business Activity Title</Label>
                  <Input 
                    id="activity-title" 
                    value={businessActivity.title} 
                    onChange={(e) => setBusinessActivity({...businessActivity, title: e.target.value})} 
                    className="bg-gray-800 border-gray-700 mt-1 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="activity-description" className="text-gray-300">Business Activity Description</Label>
                  <Textarea 
                    id="activity-description" 
                    value={businessActivity.description} 
                    onChange={(e) => setBusinessActivity({...businessActivity, description: e.target.value})} 
                    className="bg-gray-800 border-gray-700 mt-1 h-32 text-white"
                  />
                </div>
              </TabsContent>
              
              {/* Terms & Timeline Tab */}
              <TabsContent value="terms" className="p-6 space-y-6">
                <div>
                  <Label htmlFor="timeline" className="text-gray-300">Estimated Timeline</Label>
                  <Textarea 
                    id="timeline" 
                    value={timeline} 
                    onChange={(e) => setTimeline(e.target.value)} 
                    className="bg-gray-800 border-gray-700 mt-1 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="disclaimer" className="text-gray-300">Disclaimer</Label>
                  <Textarea 
                    id="disclaimer" 
                    value={disclaimer} 
                    onChange={(e) => setDisclaimer(e.target.value)} 
                    className="bg-gray-800 border-gray-700 mt-1 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="terms" className="text-gray-300">Terms and Next Steps</Label>
                  <Textarea 
                    id="terms" 
                    value={termsText} 
                    onChange={(e) => setTermsText(e.target.value)} 
                    className="bg-gray-800 border-gray-700 mt-1 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="payment-link" className="text-gray-300">Payment Link</Label>
                  <Input 
                    id="payment-link" 
                    value={paymentLink} 
                    onChange={(e) => setPaymentLink(e.target.value)} 
                    className="bg-gray-800 border-gray-700 mt-1 text-white"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {id ? `Edit Proposal - ${proposalTitle}` : 'Create New Proposal'}
            </h1>
            <p className="text-gray-400">Customize and manage your proposal details.</p>
          </div>
        </div>
        {renderContent()}
      </div>
    </AdminLayout>
  );
};

export default ProposalEditor; 