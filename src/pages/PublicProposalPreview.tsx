import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import ProposalPreview from '../components/proposal/ProposalPreview';
import supabase from '../lib/supabase';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';

interface FeeItem {
  id: string;
  description: string;
  fee: string;
}

interface BusinessActivity {
  title: string;
  description: string;
}

const PublicProposalPreview = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [proposalData, setProposalData] = useState<{
    companyName: string;
    proposalTitle: string;
    date: string;
    recipient: string;
    company: string;
    intro: string;
    services: string[];
    fees: FeeItem[];
    businessActivity: BusinessActivity;
    timeline: string;
    disclaimer: string;
    termsText: string;
    paymentLink?: string;
  } | null>(null);

  useEffect(() => {
    if (id) {
      fetchProposal(id);
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
        console.error('Error fetching proposal:', error);
        setNotFound(true);
        return;
      }

      if (data) {
        // Format the data for the preview component
        setProposalData({
          companyName: data.company_name || '',
          proposalTitle: data.title || 'Untitled Proposal',
          date: new Date(data.date).toLocaleDateString(),
          recipient: data.recipient || '',
          company: data.client || '',
          intro: data.intro || '',
          services: Array.isArray(data.services) ? data.services : [],
          fees: Array.isArray(data.fees) ? data.fees : [],
          businessActivity: data.business_activity || { title: '', description: '' },
          timeline: data.timeline || '',
          disclaimer: data.disclaimer || '',
          termsText: data.terms_text || '',
          paymentLink: data.payment_link || ''
        });
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to close the preview and navigate back
  const handleClose = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-purple-600 rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Proposal Not Found</h2>
          <p className="text-gray-300 mb-6">
            The proposal you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  if (!proposalData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <ProposalPreview
        companyName={proposalData.companyName}
        proposalTitle={proposalData.proposalTitle}
        date={proposalData.date}
        recipient={proposalData.recipient}
        company={proposalData.company}
        intro={proposalData.intro}
        services={proposalData.services}
        fees={proposalData.fees}
        businessActivity={proposalData.businessActivity}
        timeline={proposalData.timeline}
        disclaimer={proposalData.disclaimer}
        termsText={proposalData.termsText}
        paymentLink={proposalData.paymentLink}
        onClose={handleClose}
      />
    </div>
  );
};

export default PublicProposalPreview; 