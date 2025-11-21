"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditQuotationForm() {
  const router = useRouter();
  const params = useParams();
  const quotationId = params.id;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [clientInfo, setClientInfo] = useState({
    clientName: '',
    companyName: '',
    address: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: '',
    quotationNo: ''
  });

  const [services, setServices] = useState([
    { 
      id: 1, 
      heading: '', 
      selectedDetails: [], 
      otherDetails: '',
      quantity: '', 
      price: '' 
    }
  ]);

  // Load existing quotation data
  useEffect(() => {
    const fetchQuotationData = async () => {
      try {
        setFetchingData(true);
        const response = await fetch(`/api/quotations/${quotationId}`);
        const data = await response.json();
        
        if (data.success) {
          const q = data.data;
          
          // Set client info
          setClientInfo({
            clientName: q.clientName,
            companyName: q.companyName,
            address: q.address,
            phone: q.phone,
            date: q.date,
            validUntil: q.validUntil,
            quotationNo: q.quotationNo
          });

          // Parse services and reconstruct selectedDetails from details string
          const parsedServices = q.services.map((service, idx) => {
            const detailsArray = service.details ? service.details.split(', ') : [];
            
            return {
              id: Date.now() + idx,
              heading: service.heading,
              selectedDetails: detailsArray,
              otherDetails: '',
              quantity: service.quantity.toString(),
              price: service.price.toString()
            };
          });

          setServices(parsedServices.length > 0 ? parsedServices : [{
            id: Date.now(),
            heading: '',
            selectedDetails: [],
            otherDetails: '',
            quantity: '',
            price: ''
          }]);
        } else {
          showMessage('error', 'Failed to load quotation data');
        }
      } catch (error) {
        console.error('Error fetching quotation:', error);
        showMessage('error', 'Error loading quotation');
      } finally {
        setFetchingData(false);
      }
    };

    fetchQuotationData();
  }, [quotationId]);

  const serviceDetailOptions = [
    'Drone & aerial shot',
    'Customer research',
    'Sales-driven script',
    'Voice-over',
    'Motion edit',
    'Text animation',
    'Post production',
    'Caption',
    'Campaign setup',
    '100+ quality lead generation',
    'Color grading',
    'Sound design',
    'Thumbnail design'
  ];

  const handleClientChange = (field, value) => {
    setClientInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (id, field, value) => {
    setServices(prev => prev.map(service => {
      if (service.id === id) {
        if (field === 'quantity' || field === 'price') {
          return { ...service, [field]: value === '' ? '' : value };
        }
        return { ...service, [field]: value };
      }
      return service;
    }));
  };

  const handleCheckboxChange = (serviceId, option) => {
    setServices(prev => prev.map(service => {
      if (service.id === serviceId) {
        const currentDetails = service.selectedDetails || [];
        const isSelected = currentDetails.includes(option);
        const newSelected = isSelected
          ? currentDetails.filter(item => item !== option)
          : [...currentDetails, option];
        return { ...service, selectedDetails: newSelected };
      }
      return service;
    }));
  };

  const addService = () => {
    setServices(prev => [...prev, { 
      id: Date.now(), 
      heading: '', 
      selectedDetails: [], 
      otherDetails: '',
      quantity: '', 
      price: '' 
    }]);
  };

  const removeService = (id) => {
    if (services.length > 1) {
      setServices(prev => prev.filter(service => service.id !== id));
    }
  };

  const calculateTotal = () => {
    return services.reduce((total, service) => {
      const qty = parseFloat(service.quantity) || 0;
      const price = parseFloat(service.price) || 0;
      return total + (qty * price);
    }, 0);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const validateForm = () => {
    if (!clientInfo.clientName.trim()) {
      showMessage('error', 'Please enter client name');
      return false;
    }
    if (!clientInfo.companyName.trim()) {
      showMessage('error', 'Please enter company name');
      return false;
    }
    if (!clientInfo.address.trim()) {
      showMessage('error', 'Please enter address');
      return false;
    }
    if (!clientInfo.phone.trim()) {
      showMessage('error', 'Please enter phone/email');
      return false;
    }
    if (!clientInfo.validUntil) {
      showMessage('error', 'Please select valid until date');
      return false;
    }

    const validServices = services.filter(s => 
      s.heading.trim() && 
      (s.selectedDetails?.length > 0 || s.otherDetails?.trim()) && 
      parseFloat(s.price) > 0
    );
    
    if (validServices.length === 0) {
      showMessage('error', 'Please add at least one service with heading, details and price');
      return false;
    }

    return true;
  };

  const updateQuotation = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    const quotationData = {
      ...clientInfo,
      services: services
        .filter(s => 
          s.heading.trim() && 
          (s.selectedDetails?.length > 0 || s.otherDetails?.trim()) && 
          parseFloat(s.price) > 0
        )
        .map(s => {
          const allDetails = [...(s.selectedDetails || [])];
          if (s.otherDetails?.trim()) {
            allDetails.push(s.otherDetails.trim());
          }
          
          return {
            heading: s.heading,
            details: allDetails.join(', '),
            quantity: parseFloat(s.quantity) || 1,
            price: parseFloat(s.price)
          };
        }),
      totalAmount: calculateTotal()
    };

    try {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotationData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage('success', '✅ Quotation updated successfully!');
        setTimeout(() => {
          router.push('/quotations');
        }, 1500);
      } else {
        showMessage('error', data.error || 'Failed to update quotation');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quotation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto rounded-2xl shadow-xl overflow-hidden bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/quotations"
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <FileText className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Quotation</h1>
              <p className="text-blue-100 text-sm">Update quotation details</p>
            </div>
          </div>
        </div>

        {/* Alert Message */}
        {message.text && (
          <div className={`mx-6 mt-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Client Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-blue-500 text-gray-800">
              Client Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={clientInfo.clientName}
                  onChange={(e) => handleClientChange('clientName', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={clientInfo.companyName}
                  onChange={(e) => handleClientChange('companyName', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900"
                  placeholder="Enter company name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Address *
                </label>
                <input
                  type="text"
                  value={clientInfo.address}
                  onChange={(e) => handleClientChange('address', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900"
                  placeholder="Enter full address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Phone/Email *
                </label>
                <input
                  type="text"
                  value={clientInfo.phone}
                  onChange={(e) => handleClientChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900"
                  placeholder="+880 XXXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Quotation No
                </label>
                <input
                  type="text"
                  value={clientInfo.quotationNo}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 border-gray-300 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Date *
                </label>
                <input
                  type="date"
                  value={clientInfo.date}
                  onChange={(e) => handleClientChange('date', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Valid Until *
                </label>
                <input
                  type="date"
                  value={clientInfo.validUntil}
                  onChange={(e) => handleClientChange('validUntil', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Service Description & Pricing */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-blue-500 text-gray-800">
              Service Heading, Description & Pricing
            </h2>
            
            <div className="space-y-6">
              {services.map((service, index) => (
                <div key={service.id} className="p-5 rounded-lg border bg-gray-50 border-gray-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Service Heading *
                      </label>
                      <input
                        type="text"
                        value={service.heading}
                        onChange={(e) => handleServiceChange(service.id, 'heading', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900"
                        placeholder="e.g., Commercial video ad production"
                      />
                    </div>
                    {services.length > 1 && (
                      <button
                        onClick={() => removeService(service.id)}
                        className="flex-shrink-0 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Remove Service"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Checkbox Options */}
                  <div className="ml-11 mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Service Details (Select one or more) *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4 rounded-lg bg-white">
                      {serviceDetailOptions.map((option, idx) => (
                        <label
                          key={idx}
                          className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-100"
                        >
                          <input
                            type="checkbox"
                            checked={service.selectedDetails?.includes(option) || false}
                            onChange={() => handleCheckboxChange(service.id, option)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Others Field */}
                  <div className="ml-11 mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Others (Write custom details)
                    </label>
                    <textarea
                      value={service.otherDetails}
                      onChange={(e) => handleServiceChange(service.id, 'otherDetails', e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900"
                      placeholder="Add any custom service details here..."
                    />
                  </div>

                  {/* Quantity and Price */}
                  <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={service.quantity}
                        onChange={(e) => handleServiceChange(service.id, 'quantity', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900"
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Price (BDT) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={service.price}
                        onChange={(e) => handleServiceChange(service.id, 'price', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Subtotal */}
                  {service.heading && parseFloat(service.price) > 0 && (
                    <div className="mt-4 ml-11 p-3 rounded-lg bg-blue-50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Subtotal:
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          ৳{((parseFloat(service.quantity) || 0) * (parseFloat(service.price) || 0)).toLocaleString()}
                        </span>
                      </div>
                      {(service.selectedDetails?.length > 0 || service.otherDetails?.trim()) && (
                        <div className="mt-2 text-xs text-gray-600">
                          <strong>Includes:</strong> {service.selectedDetails?.join(', ')}
                          {service.otherDetails?.trim() && (service.selectedDetails?.length > 0 ? ', ' : '') + service.otherDetails}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addService}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add More Service
            </button>
          </div>

          {/* Total Amount */}
          <div className="p-6 rounded-lg mb-6 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
              <span className="text-3xl font-bold text-blue-700">
                ৳{calculateTotal().toLocaleString()}
              </span>
            </div>
          </div>

          {/* Update Button */}
          <div className="flex gap-4">
            <Link
              href="/quotations"
              className="flex-1 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Cancel
            </Link>
            <button
              onClick={updateQuotation}
              disabled={loading}
              className={`flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Quotation'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}