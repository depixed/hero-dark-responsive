import React, { useRef } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  Calendar, 
  User, 
  Building,
  X,
  Download,
  Link as LinkIcon,
  Copy
} from 'lucide-react';
import { Button } from '../ui/button';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../ui/use-toast';
import { useParams } from 'react-router-dom';

interface FeeItem {
  id: string;
  description: string;
  fee: string;
}

interface BusinessActivity {
  title: string;
  description: string;
}

interface ProposalPreviewProps {
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
  onClose: () => void;
}

const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  companyName,
  proposalTitle,
  date,
  recipient,
  company,
  intro,
  services,
  fees,
  businessActivity,
  timeline,
  disclaimer,
  termsText,
  paymentLink,
  onClose
}) => {
  const proposalRef = useRef<HTMLDivElement>(null);
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

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

  // Generate PDF using html2canvas for better rendering - without page breaks
  const handleDownloadPDF = async () => {
    if (!proposalRef.current) return;
    
    try {
      // Show loading state
      const loadingToast = document.createElement('div');
      loadingToast.className = 'fixed top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg z-50';
      loadingToast.textContent = 'Generating PDF, please wait...';
      document.body.appendChild(loadingToast);
      
      // Get the container element to be converted
      const element = proposalRef.current;
      
      // Wait for images and styles to fully load
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow images from other domains
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Get dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF with custom page size to fit the entire content without breaks
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [imgWidth, imgHeight] // Custom page size to fit content exactly
      });
      
      // Add image to PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`${companyName}-Proposal.pdf`);
      
      // Remove loading toast
      document.body.removeChild(loadingToast);
      
      // Show success message
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-green-700 text-white px-4 py-2 rounded-md shadow-lg z-50';
      successToast.textContent = 'PDF downloaded successfully!';
      document.body.appendChild(successToast);
      
      // Remove success toast after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successToast);
      }, 3000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Show error message
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 bg-red-700 text-white px-4 py-2 rounded-md shadow-lg z-50';
      errorToast.textContent = 'Error generating PDF. Please try again.';
      document.body.appendChild(errorToast);
      
      // Remove error toast after 3 seconds
      setTimeout(() => {
        document.body.removeChild(errorToast);
      }, 3000);
    }
  };

  // Copy shareable link
  const copyShareableLink = () => {
    // Only proceed if we have an ID
    if (!id) return;
    
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
      const copyButton = document.querySelector('.copy-button');
      if (copyButton) {
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        
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
      const urlDisplay = document.querySelector('.url-display');
      if (urlDisplay) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(urlDisplay);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-auto relative">
        {/* Close button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 z-10 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
        
        {/* Download button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-2 right-12 z-10 text-blue-600 hover:text-blue-800 hover:bg-blue-50 flex items-center gap-1"
          onClick={handleDownloadPDF}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        
        {/* Share button - moved to left side */}
        {id && (
          <div className="absolute top-2 left-2 z-10 flex items-center">
            <div className="bg-white text-gray-800 text-xs rounded-l px-3 py-1.5 border border-gray-200 border-r-0 max-w-[200px] truncate url-display">
              {`${window.location.origin}/proposals/${id}`}
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="bg-white rounded-l-none rounded-r text-green-600 hover:text-green-800 hover:bg-green-50 border border-gray-200 border-l-0 h-[30px] px-2 copy-button"
              onClick={copyShareableLink}
              title="Copy shareable link"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Proposal content */}
        <div ref={proposalRef} className="p-8 text-black">
          {/* Logo and Header */}
          <header className="mb-12">
            <div className="flex justify-center mb-6">
              <img src="/incorpify-logocolor.png" alt="Incorpify Logo" className="h-16 object-contain" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-3">
                {companyName}
              </h1>
              <p className="text-xl text-gray-600 mb-6 font-light">
                {proposalTitle}
              </p>
              <div className="inline-block border-t border-b border-gray-200 py-4 px-8">
                <div className="flex flex-row justify-between items-center space-x-8">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    <p>
                      Date: <span className="font-medium">{date}</span>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-blue-600 mr-2" />
                    <p>
                      To: <span className="font-medium">{recipient}</span>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-blue-600 mr-2" />
                    <p>
                      For: <span className="font-medium">{company}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Introduction */}
          <section className="mb-12 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
            <p className="text-gray-700 leading-relaxed">
              {intro}
            </p>
          </section>

          {/* Scope of Service */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6 flex items-center">
              <span className="bg-blue-600 w-2 h-8 mr-3 rounded-sm inline-block"></span>
              Scope of Service
            </h2>
            <p className="mb-4 text-gray-700">Our incorporation package includes:</p>
            <ul className="space-y-3 mt-4">
              {services.map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Fees Table */}
          {fees.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6 flex items-center">
                <span className="bg-blue-600 w-2 h-8 mr-3 rounded-sm inline-block"></span>
                Breakdown of Estimated Fees
              </h2>
              <div className="overflow-x-auto rounded-lg shadow">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <th className="p-4 text-left font-semibold rounded-tl-lg">Description</th>
                      <th className="p-4 text-left font-semibold rounded-tr-lg">Estimated Fees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="p-4 border-t border-gray-200">{item.description}</td>
                        <td className="p-4 border-t border-gray-200 font-medium">{item.fee}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 font-bold">
                      <td className="p-4 border-t border-gray-200 rounded-bl-lg">TOTAL</td>
                      <td className="p-4 border-t border-gray-200 text-blue-700 rounded-br-lg">{calculateTotal()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm italic text-gray-500 mt-3 ml-2">*The license must be renewed annually</p>
            </section>
          )}

          {/* Business Activity */}
          {businessActivity.title && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6 flex items-center">
                <span className="bg-blue-600 w-2 h-8 mr-3 rounded-sm inline-block"></span>
                Proposed Business Activity
              </h2>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <p className="font-semibold text-lg text-blue-700 mb-3">{businessActivity.title}</p>
                <p className="text-gray-700 leading-relaxed">
                  {businessActivity.description}
                </p>
              </div>
            </section>
          )}

          {/* Timeline */}
          {timeline && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6 flex items-center">
                <span className="bg-blue-600 w-2 h-8 mr-3 rounded-sm inline-block"></span>
                Estimated Completion Time
              </h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {timeline}
                </p>
                {disclaimer && (
                  <div className="mt-4 p-4 bg-white rounded border-l-4 border-amber-500">
                    <p className="text-sm text-gray-600">
                      {disclaimer}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Terms */}
          {termsText && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6 flex items-center">
                <span className="bg-blue-600 w-2 h-8 mr-3 rounded-sm inline-block"></span>
                Terms & Next Steps
              </h2>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-gray-700 leading-relaxed">
                  {termsText}
                </p>
                <div className="mt-6 flex items-center justify-center gap-4">
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium flex items-center hover:shadow-lg transition-all duration-300">
                    Contact Us to Proceed
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                  {paymentLink && (
                    <a 
                      href={paymentLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium flex items-center hover:shadow-lg transition-all duration-300"
                    >
                      Approve and Pay
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-500">
                  Date: <span className="font-medium">{date}</span>
                </p>
                <p className="text-gray-500">
                  Signature: <span className="font-medium">{companyName}</span>
                </p>
              </div>
              <div className="flex items-center">
                <img src="/incorpify-logocolor.png" alt="Incorpify Logo" className="h-8 object-contain" />
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ProposalPreview; 