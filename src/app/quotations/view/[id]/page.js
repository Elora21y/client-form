'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import bg from '../../../../../public/assets/kbn-quotation-bg.jpg'
import Image from 'next/image';

export default function ViewQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id;
  const printRef = useRef();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchQuotation();
  }, [quotationId]);

  const fetchQuotation = async () => {
    try {
      const response = await fetch(`/api/quotations/${quotationId}`);
      const data = await response.json();
      
      if (data.success) {
        setQuotation(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    
    try {
      const element = printRef.current;
      
      // Create canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // A4 size: 210mm x 297mm
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit A4
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      // Add more pages if content is longer
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      // Download PDF
      pdf.save(`Quotation_${quotation.quotationNo}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quotation...</p>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Quotation not found</p>
          <Link href="/quotations" className="text-blue-600 hover:underline">
            Back to Quotations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
          <Link 
            href="/quotations"
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download PDF
              </>
            )}
          </button>
        </div>

        {/* Quotation Design */}
        <div 
          ref={printRef}
          className=" shadow-2xl bg-[url(/assets/kbn-quotation-bg.jpg)] bg-cover bg-center"
          style={{
            width: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            position: 'relative',
            // backgroundSize: 'cover',
            // backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          
        >
          {/* Header */}
          <div className="pt-36 px-14 ">

            {/* Client Information */}
                <div className="mb-6  text-gray-500 text-sm -space-y-0.5">
                  <p><span className='font-semibold text-gray-600'>Client Name:</span> {quotation.clientName}</p>
                  <p><span className='font-semibold text-gray-600'>Company Name:</span> {quotation.companyName}</p>
                  <p><span className='font-semibold text-gray-600'>Address:</span> {quotation.address}</p>
                  <p><span className='font-semibold text-gray-600'>Phone:</span> {quotation.phone}</p>
                  <p><span className='font-semibold text-gray-600'>Date:</span> {quotation.date}</p>
                  <p><span className='font-semibold text-gray-600'> Quotation No:</span> {quotation.quotationNo}</p>
                  <p><span className='font-semibold text-gray-600'>  Valid Until:</span> {quotation.validUntil}</p>
                </div>

            {/* Service Description & Pricing */}
            <div className="mb-8">
              <h3 className="font-bold text-center text-gray-600 text-xl pb-3">Service Description & Pricing</h3>
              
              <table className="w-full  ">
                <thead>
                  <tr className="border-t-2 border-b-2 border-gray-500 text-[15px] font-medium">
                    <th className="text-center py-2 w-12">SL</th>
                    <th className="text-center py-2">Service Details</th>
                    <th className="text-center py-2 w-24">Quantity</th>
                    <th className="text-right py-2 w-32">Budget Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.services.map((service, index) => (
                    <tr key={index} className="border-b border-gray-700  text-gray-700 font-semibold">
                      <td className="py-4 align-top text-center">{index + 1}</td>
                      <td className="py-4">
                        <p className="font-bold text-gray-800 ">{service.heading}</p>
                        <p className='text-[13px]'>{service.details}</p>
                      </td>
                      <td className="py-4 text-center align-top">{service.quantity}</td>
                      <td className="py-4 text-center align-top ">
                        ৳{(service.quantity * service.price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-500 font-bold">
                    <td colSpan="3" className="py-3 text-right">Total:</td>
                    <td className="py-3 text-center text-lg  ">৳{quotation.totalAmount.toLocaleString()}
                      <div  className="w-24 h-0.5 bg-linear-to-r from-transparent via-gray-600 to-transparent mx-auto mt-1"></div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Terms & Conditions */}
            <div className="mb-8 text-gray-600 text-sm">
              <h3 className="font-bold border-b w-34 border-gray-500 mb-3">Terms & Conditions</h3>
                <div>
                  <p ><span className="font-bold">Advance: 60%</span> before project starts</p>
                  <p ><span className="font-bold">Delivery Timeline: 7-15</span> working days after advance</p>
                  <p><span className="font-bold">Payment Method:</span> Bank transfer / bKash / Cheque / Mobile Banking</p>
                </div>
                <br/>
                <div  className="font-semibold">
                  <p >(bKash/Nagad - 01670974710, 01612045623)</p>
                  <p ><span >Account Name:</span> KBN PRODUCTION</p>
                  <p ><span >Bank Name:</span> City Bank (DSE Nikunja Branch)</p>
                  <p ><span >Account Number:</span> 1504195269001</p>
                </div>
            </div>

            {/* Footer */}
            <div className="text-gray-600 pb-8 font-medium text-sm -space-y-0.5">
                
                  <p className="text-[15px] font-bold mb-1">Prepared By:</p>
                  <p>Shourov Hossain Riyan</p>
                  <p >Co-Founder & CMO</p>
                  <p >KBN Production Ltd</p>
              
                
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}