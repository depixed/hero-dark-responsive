import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '../components/ui/dialog';
import { getLeads, deleteLead, deleteLeads, updateLeadStatus, Lead } from '../lib/supabase';
import { Search, ChevronDown, ChevronUp, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from "react-hot-toast";
import {
  questions as initialQuestions,
  incorporationCountryQuestion,
  questions_new_company,
  questions_existing_uae,
  questions_existing_other,
  Question
} from "@/components/IncorporationChat";

// Status configuration
const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-500' },
  contacted: { label: 'Contacted', color: 'bg-yellow-500' },
  qualified: { label: 'Qualified', color: 'bg-green-500' },
  converted: { label: 'Converted', color: 'bg-purple-500' },
  lost: { label: 'Lost', color: 'bg-gray-500' }
} as const;

// Combine all questions into a single map for easy lookup
const allQuestionsMap: Map<string, Question> = new Map();
initialQuestions.forEach(q => allQuestionsMap.set(q.id, q));
allQuestionsMap.set(incorporationCountryQuestion.id, incorporationCountryQuestion);
questions_new_company.forEach(q => allQuestionsMap.set(q.id, q));
questions_existing_uae.forEach(q => allQuestionsMap.set(q.id, q));
questions_existing_other.forEach(q => allQuestionsMap.set(q.id, q));

// Define the logical order of all possible questions across flows
const orderedQuestionIdsMasterList = [
  initialQuestions.find(q => q.id === 'company_status')?.id,
  incorporationCountryQuestion.id,
  ...questions_new_company.map(q => q.id),
  ...questions_existing_uae.map(q => q.id),
  ...questions_existing_other.map(q => q.id),
].filter((id): id is string => !!id); // Filter out undefined and ensure type string

// Remove duplicates while preserving the first occurrence order
const uniqueOrderedQuestionIds = Array.from(new Set(orderedQuestionIdsMasterList));

const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof Lead>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await getLeads();
        setLeads(data);
        setFilteredLeads(data);
      } catch (error) {
        console.error('Error fetching leads:', error);
        setError('Failed to load leads data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Reset selected leads when filtered leads change
  useEffect(() => {
    setSelectedLeadIds([]);
  }, [filteredLeads.length]);

  // Filter leads based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLeads(leads);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = leads.filter(
        lead =>
          lead.name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.phone.toLowerCase().includes(query)
      );
      setFilteredLeads(filtered);
    }
  }, [searchQuery, leads]);

  // Sort leads
  useEffect(() => {
    const sorted = [...filteredLeads].sort((a, b) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];
      
      // Convert to strings for comparison if they're not already
      if (typeof fieldA !== 'string') fieldA = String(fieldA);
      if (typeof fieldB !== 'string') fieldB = String(fieldB);

      if (sortDirection === 'asc') {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });
    
    setFilteredLeads(sorted);
  }, [sortField, sortDirection]);

  const handleSort = (field: keyof Lead) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: keyof Lead) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleDeleteLead = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteError(null);
  };

  const handleToggleSelectLead = (leadId: string) => {
    setSelectedLeadIds(prev => {
      if (prev.includes(leadId)) {
        return prev.filter(id => id !== leadId);
      } else {
        return [...prev, leadId];
      }
    });
  };

  const handleSelectAllLeads = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Select all leads in the current filtered view
      setSelectedLeadIds(filteredLeads.map(lead => lead.id));
    } else {
      // Deselect all
      setSelectedLeadIds([]);
    }
  };

  const openBulkDeleteModal = () => {
    if (selectedLeadIds.length === 0) return;
    setIsBulkDeleteModalOpen(true);
    setDeleteError(null);
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      await deleteLead(leadToDelete.id);
      
      // Update the local state to remove the deleted lead
      const updatedLeads = leads.filter(lead => lead.id !== leadToDelete.id);
      setLeads(updatedLeads);
      
      // Close the confirmation dialog
      setLeadToDelete(null);
      toast.success('Lead deleted successfully');
    } catch (error) {
      console.error('Error deleting lead:', error);
      setDeleteError('Failed to delete lead. Please try again later.');
      toast.error('Failed to delete lead');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedLeadIds.length === 0) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      await deleteLeads(selectedLeadIds);
      
      // Update the local state to remove the deleted leads
      const updatedLeads = leads.filter(lead => !selectedLeadIds.includes(lead.id));
      setLeads(updatedLeads);
      
      // Clear selection and close modal
      setSelectedLeadIds([]);
      setIsBulkDeleteModalOpen(false);
      toast.success(`Successfully deleted ${selectedLeadIds.length} leads`);
    } catch (error) {
      console.error('Error deleting leads:', error);
      setDeleteError('Failed to delete leads. Please try again later.');
      toast.error('Failed to delete leads');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Add the handleStatusChange function
  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const updatedLead = await updateLeadStatus(leadId, newStatus);
      
      // Update both leads and filteredLeads in state
      const updateLeadInList = (list: Lead[]) => 
        list.map(lead => lead.id === leadId ? updatedLead : lead);
      
      setLeads(leads => updateLeadInList(leads));
      setFilteredLeads(leads => updateLeadInList(leads));
      
      // If this lead is currently selected, update it in the modal
      if (selectedLead?.id === leadId) {
        setSelectedLead(updatedLead);
      }
      
      toast.success('Lead status updated successfully');
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Failed to update lead status');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Leads</h1>
            <p className="text-gray-400">Manage your incorporation leads.</p>
          </div>
          
          {/* Bulk Actions */}
          {selectedLeadIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">
                {selectedLeadIds.length} {selectedLeadIds.length === 1 ? 'lead' : 'leads'} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={openBulkDeleteModal}
                className="bg-red-900 hover:bg-red-800 text-white border-none"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>

        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search leads..."
              className="w-full pl-9 bg-gray-900 border-gray-800 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="p-4 text-left">
                      <div className="flex items-center justify-center relative">
                        <Checkbox
                          id="select-all"
                          checked={selectedLeadIds.length > 0 && selectedLeadIds.length === filteredLeads.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLeadIds(filteredLeads.map(lead => lead.id));
                            } else {
                              setSelectedLeadIds([]);
                            }
                          }}
                          className={`border-gray-600 ${
                            selectedLeadIds.length > 0 && selectedLeadIds.length < filteredLeads.length
                              ? 'bg-purple-600/50 border-purple-600/50'
                              : 'data-[state=checked]:bg-purple-600 data-[state=checked]:border-transparent'
                          }`}
                        />
                        {/* Custom indeterminate indicator */}
                        {selectedLeadIds.length > 0 && selectedLeadIds.length < filteredLeads.length && (
                          <div className="absolute w-2 h-2 bg-white rounded-full left-[9px]"></div>
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 text-gray-400 font-medium cursor-pointer hover:text-white"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 text-gray-400 font-medium cursor-pointer hover:text-white"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Email</span>
                        {getSortIcon('email')}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 text-gray-400 font-medium cursor-pointer hover:text-white"
                      onClick={() => handleSort('phone')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Phone</span>
                        {getSortIcon('phone')}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 text-gray-400 font-medium cursor-pointer hover:text-white"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 text-gray-400 font-medium cursor-pointer hover:text-white"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Date</span>
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                    <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <tr 
                        key={lead.id} 
                        className={`border-b border-gray-800 hover:bg-gray-800/50 ${
                          selectedLeadIds.includes(lead.id) ? 'bg-gray-800/50' : ''
                        }`}
                      >
                        <td className="p-2 w-[56px]">
                          <div className="flex justify-center items-center">
                            <Checkbox
                              checked={selectedLeadIds.includes(lead.id)}
                              onCheckedChange={() => handleToggleSelectLead(lead.id)}
                              className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-transparent"
                            />
                          </div>
                        </td>
                        <td className="p-4 text-white">{lead.name}</td>
                        <td className="p-4 text-white">{lead.email}</td>
                        <td className="p-4 text-white">{lead.phone}</td>
                        <td className="p-4">
                          <div className="relative inline-block">
                            <select
                              value={lead.status || 'new'}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                              className={`appearance-none pl-3 pr-8 py-1 rounded-full text-sm font-medium text-white border-0 cursor-pointer ${STATUS_CONFIG[lead.status || 'new'].color}`}
                            >
                              {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                              <ChevronDown className="h-4 w-4 text-white opacity-75" />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-white">{formatDate(lead.created_at)}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewLead(lead)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLead(lead)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-gray-400">
                        {searchQuery ? 'No leads found matching your search.' : 'No leads available yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Lead Details Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1CD2E8] via-[#965BE4] to-[#201B36]">
                  Lead Details
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Submitted on {formatDate(selectedLead.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-800/50 p-4 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-sm">Name</p>
                      <p className="text-white">{selectedLead.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white">{selectedLead.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Phone</p>
                      <p className="text-white">{selectedLead.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <div className="relative inline-block mt-1">
                        <select
                          value={selectedLead.status || 'new'}
                          onChange={(e) => handleStatusChange(selectedLead.id, e.target.value as Lead['status'])}
                          className={`appearance-none pl-3 pr-8 py-1 rounded-full text-sm font-medium text-white border-0 cursor-pointer ${STATUS_CONFIG[selectedLead.status || 'new'].color}`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                          <ChevronDown className="h-4 w-4 text-white opacity-75" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Questionnaire Answers - MODIFIED for Order */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Questionnaire Answers</h3>
                  <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg">
                    {selectedLead.answers && Object.keys(selectedLead.answers).length > 0 ? (
                      // Iterate through the ordered list of IDs
                      uniqueOrderedQuestionIds.map((key) => {
                        // Check if the lead actually answered this question
                        const value = selectedLead.answers[key];
                        if (value === undefined || value === null) return null; 
                        
                        const question = allQuestionsMap.get(key);
                        const questionText = question ? question.text : `Unknown Question (${key})`; 

                        // Determine the answer text (handle single vs multi-select)
                        let answerText = '';
                        if (Array.isArray(value)) {
                           answerText = value.map(v => {
                              const option = question?.options?.find(opt => opt.id === v);
                              return option ? option.text : v; 
                            }).join(', ');
                        } else {
                            const option = question?.options?.find(opt => opt.id === value);
                            answerText = option ? option.text : value; 
                        }

                        return (
                          <div key={key} className="border-b border-gray-700 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                            <p className="text-gray-400 text-sm font-medium">
                              {questionText}
                            </p>
                            <p className="text-white mt-1">
                              {answerText}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-400 italic text-center py-4">
                        No questionnaire answers available for this lead.
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-800">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedLead(null);
                      handleDeleteLead(selectedLead);
                    }}
                    className="bg-red-900 hover:bg-red-800 text-white border-none"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Lead
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirmation Modal */}
      <Dialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this lead? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {leadToDelete && (
            <div className="py-4">
              <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                <p className="text-gray-400 text-sm">Name</p>
                <p className="text-white font-medium">{leadToDelete.name}</p>
                <p className="text-gray-400 text-sm mt-2">Email</p>
                <p className="text-white">{leadToDelete.email}</p>
              </div>
              
              {deleteError && (
                <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 rounded-md text-sm mb-4">
                  {deleteError}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLeadToDelete(null)}
              className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteLead}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Lead
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              Confirm Bulk Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete {selectedLeadIds.length} {selectedLeadIds.length === 1 ? 'lead' : 'leads'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
              <p className="text-white text-sm mb-2">
                You are about to delete {selectedLeadIds.length} {selectedLeadIds.length === 1 ? 'lead' : 'leads'}, including:
              </p>
              <ul className="text-gray-300 text-sm space-y-1 max-h-40 overflow-y-auto">
                {leads
                  .filter(lead => selectedLeadIds.includes(lead.id))
                  .slice(0, 5)
                  .map(lead => (
                    <li key={lead.id} className="flex items-center">
                      <span>• {lead.name} ({lead.email})</span>
                    </li>
                  ))}
                {selectedLeadIds.length > 5 && (
                  <li className="text-gray-400 italic">
                    And {selectedLeadIds.length - 5} more...
                  </li>
                )}
              </ul>
            </div>
            
            {deleteError && (
              <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 rounded-md text-sm mb-4">
                {deleteError}
              </div>
            )}
          </div>

          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBulkDeleteModalOpen(false)}
              className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmBulkDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {selectedLeadIds.length} {selectedLeadIds.length === 1 ? 'Lead' : 'Leads'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default LeadsPage; 