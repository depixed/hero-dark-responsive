import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Plus, Search, MoreHorizontal, Pencil, Trash, Eye, Link as LinkIcon, Copy, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import supabase from '../lib/supabase'; // Update to use default import
import { useToast } from '../components/ui/use-toast';

interface Proposal {
  id: string;
  title: string;
  client: string;
  recipient: string;
  date: string;
  status: string;
  company_name: string;
}

const ProposalPage = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchProposals();
  }, []);
  
  // Fetch proposals from Supabase
  const fetchProposals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('id, title, client, recipient, date, status, company_name')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setProposals(data || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load proposals. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a proposal
  const deleteProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setProposals(proposals.filter(p => p.id !== id));
      toast({
        title: 'Success',
        description: 'Proposal deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete proposal. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Create a new proposal
  const createProposal = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .insert([{
          title: 'Untitled Proposal',
          client: '',
          recipient: '',
          company_name: '',
          status: 'Draft',
          date: new Date().toISOString(),
          services: [],
          fees: [],
          business_activity: { title: '', description: '' },
          timeline: '',
          disclaimer: '',
          terms_text: ''
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      if (data && data[0]) {
        // Navigate to the editor with the new proposal ID
        navigate(`/admin/proposals/${data[0].id}`);
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to create proposal. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Filter proposals based on search query
  const filteredProposals = proposals.filter(proposal => 
    proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    proposal.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    proposal.recipient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-600 text-white';
      case 'Sent':
        return 'bg-blue-600 text-white';
      case 'Accepted':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  // Show share modal with URL
  const handleShowShareModal = (id: string) => {
    const baseUrl = window.location.origin;
    const shareableUrl = `${baseUrl}/proposals/${id}`;
    setCurrentShareUrl(shareableUrl);
    setShowShareModal(true);
  };

  // Copy shareable link
  const copyShareableLink = () => {
    // Direct approach - use the Clipboard API with fallback
    try {
      // Simple but effective approach
      const el = document.createElement('textarea');
      el.value = currentShareUrl;
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
      const copyBtn = document.querySelector('.modal-copy-button');
      if (copyBtn) {
        const originalContent = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        
        setTimeout(() => {
          copyBtn.innerHTML = originalContent;
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
        description: "Please copy this URL manually: " + currentShareUrl,
        variant: "destructive",
      });
      
      // Attempt to select the text for easier manual copying
      const urlField = document.querySelector('.modal-url-field');
      if (urlField) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(urlField);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Proposals</h1>
            <p className="text-gray-400">Create and manage business proposals for clients.</p>
          </div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={createProposal}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Proposal
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search proposals..." 
                className="pl-8 bg-gray-800 border-gray-700 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-800">
                  <TableRow className="border-gray-700 hover:bg-gray-800">
                    <TableHead className="text-gray-300">Title</TableHead>
                    <TableHead className="text-gray-300">Client</TableHead>
                    <TableHead className="text-gray-300">Recipient</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-400">
                        Loading proposals...
                      </TableCell>
                    </TableRow>
                  ) : filteredProposals.length > 0 ? (
                    filteredProposals.map(proposal => (
                      <TableRow key={proposal.id} className="border-gray-800 hover:bg-gray-800/50">
                        <TableCell className="font-medium text-white">{proposal.title}</TableCell>
                        <TableCell className="text-gray-300">{proposal.client}</TableCell>
                        <TableCell className="text-gray-300">{proposal.recipient}</TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(proposal.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(proposal.status)}`}>
                            {proposal.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                              <DropdownMenuItem 
                                className="text-gray-300 focus:bg-gray-700 focus:text-white cursor-pointer"
                                onClick={() => navigate(`/admin/proposals/view/${proposal.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-gray-300 focus:bg-gray-700 focus:text-white cursor-pointer"
                                onClick={() => navigate(`/admin/proposals/${proposal.id}`)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-green-500 focus:bg-gray-700 focus:text-green-400 cursor-pointer"
                                onClick={() => handleShowShareModal(proposal.id)}
                              >
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Share Link
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-500 focus:bg-red-950/30 focus:text-red-400 cursor-pointer"
                                onClick={() => deleteProposal(proposal.id)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-400">
                        {searchQuery 
                          ? "No proposals matching your search criteria" 
                          : "No proposals found. Create your first proposal."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full relative">
            <button 
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={() => setShowShareModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-4">Share Proposal</h3>
            
            <p className="text-gray-300 mb-4">Anyone with this link can view the proposal:</p>
            
            <div className="flex mb-6">
              <div className="bg-gray-800 text-gray-300 rounded-l px-3 py-2 border border-gray-700 border-r-0 flex-1 overflow-x-auto whitespace-nowrap modal-url-field">
                {currentShareUrl}
              </div>
              <Button
                variant="outline"
                className="rounded-l-none border border-gray-700 bg-gray-800 hover:bg-gray-700 text-white modal-copy-button"
                onClick={copyShareableLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-white mr-2"
                onClick={() => setShowShareModal(false)}
              >
                Close
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  copyShareableLink();
                  setTimeout(() => setShowShareModal(false), 1000);
                }}
              >
                Copy & Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProposalPage; 