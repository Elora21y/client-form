"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Moon, Sun, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuotationForm() {
  const [darkMode, setDarkMode] = useState(false);
  const [nextQuotationNumber, setNextQuotationNumber] = useState(116);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
const router = useRouter()
  
  const [clientInfo, setClientInfo] = useState({
    clientName: '',
    companyName: '',
    address: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: '',
    quotationNo: `KBN-OT-${nextQuotationNumber}`
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

  // Load quotation number from database on mount
  useEffect(() => {
    const fetchLastQuotationNumber = async () => {
      try {
        const response = await fetch('/api/quotations/last-number');
        const data = await response.json();
        
        console.log('📊 Last quotation data:', data);
        
        if (data.success && data.lastNumber) {
          const nextNum = data.lastNumber + 1;
          console.log('🔢 Next quotation number:', nextNum);
          
          setNextQuotationNumber(nextNum);
          setClientInfo(prev => ({ 
            ...prev, 
            quotationNo: `KBN-OT-${nextNum}` 
          }));
        } else {
          setNextQuotationNumber(116);
          setClientInfo(prev => ({ 
            ...prev, 
            quotationNo: 'KBN-OT-116' 
          }));
        }
      } catch (error) {
        console.error('❌ Error fetching quotation number:', error);
        setNextQuotationNumber(116);
        setClientInfo(prev => ({ 
          ...prev, 
          quotationNo: 'KBN-OT-116' 
        }));
      }
    };
    
    fetchLastQuotationNumber();
  }, []);

  // Service detail options
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
      (s.selectedDetails.length > 0 || s.otherDetails.trim()) && 
      parseFloat(s.price) > 0
    );
    
    if (validServices.length === 0) {
      showMessage('error', 'Please add at least one service with heading, details and price');
      return false;
    }

    return true;
  };

  const saveToDatabase = async (quotationData) => {
    try {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotationData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage('success', '✅ Quotation saved successfully!');
        
        const newQuotationNum = nextQuotationNumber + 1;
        setNextQuotationNumber(newQuotationNum);
        setClientInfo({
          clientName: '',
          companyName: '',
          address: '',
          phone: '',
          date: new Date().toISOString().split('T')[0],
          validUntil: '',
          quotationNo: `KBN-OT-${newQuotationNum}`
        });
        setServices([{ 
          id: Date.now(), 
          heading: '', 
          selectedDetails: [],
          otherDetails: '',
          quantity: '', 
          price: '' 
        }]);
      } else {
        showMessage('error', data.error || 'Failed to save quotation');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', 'Network error. Please check your connection.');
    }
  };

  //submit
  const generateQuotation = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    const quotationData = {
      ...clientInfo,
      services: services
        .filter(s => 
          s.heading.trim() && 
          (s.selectedDetails.length > 0 || s.otherDetails.trim()) && 
          parseFloat(s.price) > 0
        )
        .map(s => {
          // Combine selected details and other details
          const allDetails = [...s.selectedDetails];
          if (s.otherDetails.trim()) {
            allDetails.push(s.otherDetails.trim());
          }
          
          return {
            heading: s.heading,
            details: allDetails.join(', '),
            quantity: parseFloat(s.quantity) || 1,
            price: parseFloat(s.price)
          };
        }),
      totalAmount: calculateTotal(),
      createdAt: new Date().toISOString()
    };
    
    await saveToDatabase(quotationData);
    setLoading(false);
    router.push('/quotations')
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    } p-4 md:p-8`}>
      <div className={`max-w-6xl mx-auto rounded-2xl shadow-xl overflow-hidden ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 md:p-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">KBN Production Ltd</h1>
                <p className="text-blue-100 text-sm">Address: H: 15, Road: 29/D, Mirpur 10, Dhaka 1216</p>
                <p className="text-blue-100 text-sm">Mobile: 01790262663 | Email: kbnproductionltd@gmail.com</p>
              </div>
            </div>
          </div>
          <p className="text-blue-100 font-semibold">Quotation Form</p>
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
            <h2 className={`text-xl font-semibold mb-4 pb-2 border-b-2 border-blue-500 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Client Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Client Name *
                </label>
                <input
                  type="text"
                  value={clientInfo.clientName}
                  onChange={(e) => handleClientChange('clientName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={clientInfo.companyName}
                  onChange={(e) => handleClientChange('companyName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter company name"
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Address *
                </label>
                <input
                  type="text"
                  value={clientInfo.address}
                  onChange={(e) => handleClientChange('address', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter full address"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Phone/Email *
                </label>
                <input
                  type="text"
                  value={clientInfo.phone}
                  onChange={(e) => handleClientChange('phone', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="+880 XXXXXXXXXX"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Quotation No
                </label>
                <input
                  type="text"
                  value={clientInfo.quotationNo}
                  readOnly
                  className={`w-full px-4 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-gray-900 border-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-50 border-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date *
                </label>
                <input
                  type="date"
                  value={clientInfo.date}
                  onChange={(e) => handleClientChange('date', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Valid Until *
                </label>
                <input
                  type="date"
                  value={clientInfo.validUntil}
                  onChange={(e) => handleClientChange('validUntil', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Service Description & Pricing */}
          <div className="mb-8">
            <h2 className={`text-xl font-semibold mb-4 pb-2 border-b-2 border-blue-500 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Service Heading, Description & Pricing
            </h2>
            
            <div className="space-y-6">
              {services.map((service, index) => (
                <div key={service.id} className={`p-5 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Service Heading *
                      </label>
                      <input
                        type="text"
                        value={service.heading}
                        onChange={(e) => handleServiceChange(service.id, 'heading', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
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
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Service Details (Select one or more) *
                    </label>
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4 rounded-lg ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                      {serviceDetailOptions.map((option, idx) => (
                        <label
                          key={idx}
                          className={`flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-opacity-50`}
                        >
                          <input
                            type="checkbox"
                            checked={service.selectedDetails?.includes(option) || false}
                            onChange={() => handleCheckboxChange(service.id, option)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className={`text-sm ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Others Field */}
                  <div className="ml-11 mb-4">
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Others (Write custom details)
                    </label>
                    <textarea
                      value={service.otherDetails}
                      onChange={(e) => handleServiceChange(service.id, 'otherDetails', e.target.value)}
                      rows="2"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Add any custom service details here..."
                    />
                  </div>

                  {/* Quantity and Price */}
                  <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={service.quantity}
                        onChange={(e) => handleServiceChange(service.id, 'quantity', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Price (BDT) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={service.price}
                        onChange={(e) => handleServiceChange(service.id, 'price', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Subtotal */}
                  {service.heading && parseFloat(service.price) > 0 && (
                    <div className={`mt-4 ml-11 p-3 rounded-lg ${
                      darkMode ? 'bg-gray-800' : 'bg-blue-50'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Subtotal:
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          ৳{((parseFloat(service.quantity) || 0) * (parseFloat(service.price) || 0)).toLocaleString()}
                        </span>
                      </div>
                      {(service.selectedDetails?.length > 0 || service.otherDetails?.trim()) && (
                        <div className={`mt-2 text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
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
          <div className={`p-6 rounded-lg mb-6 ${
            darkMode 
              ? 'bg-gradient-to-r from-blue-900 to-blue-800' 
              : 'bg-gradient-to-r from-blue-50 to-blue-100'
          }`}>
            <div className="flex justify-between items-center">
              <span className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Total Amount:</span>
              <span className={`text-3xl font-bold ${
                darkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                ৳{calculateTotal().toLocaleString()}
              </span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateQuotation}
            disabled={loading}
            className={`w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center justify-center gap-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Generate Quotation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}