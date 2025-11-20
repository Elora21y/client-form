// 'use client';
// import { useState, useEffect } from 'react';
// import { FileText, Search, Loader2 } from 'lucide-react';
// import Link from 'next/link';

// export default function QuotationsPage() {
//   const [quotations, setQuotations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');

//   useEffect(() => {
//     const fetchQuotations = async () => {
//       try {
//         const response = await fetch(`/api/quotations?search=${search}`);
//         const data = await response.json();

//         if (data.success) {
//           setQuotations(data.data);
//         }
//       } catch (error) {
//         console.error('Error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchQuotations();
//   }, [search]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center gap-3">
//             <FileText className="w-10 h-10 text-blue-600" />
//             <h1 className="text-3xl font-bold text-gray-800">All Quotations</h1>
//           </div>
//           <Link
//             href="/client-form"
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             + New Quotation
//           </Link>
//         </div>

//         {/* Search */}
//         <form onSubmit={(e) => e.preventDefault()} className="mb-6">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search by client name, company, or quotation number..."
//               className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//         </form>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div className="bg-white p-6 rounded-lg shadow">
//             <p className="text-sm text-gray-600">Total Quotations</p>
//             <p className="text-3xl font-bold text-blue-600">{quotations.length}</p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow">
//             <p className="text-sm text-gray-600">Total Value</p>
//             <p className="text-3xl font-bold text-green-600">
//               ৳{quotations.reduce((sum, q) => sum + q.totalAmount, 0).toLocaleString()}
//             </p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow">
//             <p className="text-sm text-gray-600">Latest</p>
//             <p className="text-xl font-bold text-gray-800">
//               {quotations[0]?.quotationNo || 'N/A'}
//             </p>
//           </div>
//         </div>

//         {/* Quotations List */}
//         <div className="grid gap-4">
//           {quotations.length === 0 ? (
//             <div className="bg-white p-12 rounded-lg shadow text-center">
//               <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <p className="text-gray-500">No quotations found</p>
//             </div>
//           ) : (
//             quotations.map((q) => (
//               <div key={q._id} className="bg-white border border-gray-200 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-3 mb-2">
//                       <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
//                         {q.quotationNo}
//                       </span>
//                       <span className="text-sm text-gray-500">
//                         {new Date(q.createdAt).toLocaleDateString('en-GB', {
//                           day: '2-digit',
//                           month: 'short',
//                           year: 'numeric'
//                         })}
//                       </span>
//                     </div>

//                     <h3 className="text-xl font-bold text-gray-800 mb-1">{q.clientName}</h3>
//                     <p className="text-gray-600 mb-1">{q.companyName}</p>
//                     <p className="text-sm text-gray-500 mb-3">{q.address}</p>
//                     <p className="text-sm text-gray-600 mb-3">📞 {q.phone}</p>

//                     <div className="border-t pt-3 mt-3">
//                       <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
//                       <div className="space-y-2">
//                         {q.services?.map((service, idx) => (
//                           <div key={idx} className="p-3 bg-gray-50 rounded-lg">
//                             <div className="flex justify-between items-start mb-1">
//                               <span className="font-semibold text-gray-800">
//                                 {idx + 1}. {service.heading || 'N/A'}
//                               </span>
//                               <span className="font-semibold text-blue-600">
//                                 {service.quantity} × ৳{service.price?.toLocaleString()}
//                               </span>
//                             </div>
//                             <p className="text-xs text-gray-600 mt-1">
//                               {service.details?.substring(0, 100)}
//                               {service.details?.length > 100 ? '...' : ''}
//                             </p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="ml-6 text-right">
//                     <p className="text-sm text-gray-500 mb-1">Total Amount</p>
//                     <p className="text-3xl font-bold text-green-600">
//                       ৳{q.totalAmount.toLocaleString()}
//                     </p>
//                     <p className="text-xs text-gray-500 mt-2">
//                       Valid until: {new Date(q.validUntil).toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Loader2,
  Calendar,
  Phone,
  MapPin,
  Package,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const filtered = quotations.filter(
        (q) =>
          q.clientName.toLowerCase().includes(search.toLowerCase()) ||
          q.companyName.toLowerCase().includes(search.toLowerCase()) ||
          q.quotationNo.toLowerCase().includes(search.toLowerCase()) ||
          q.phone.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredQuotations(filtered);
    } else {
      setFilteredQuotations(quotations);
    }
  }, [search, quotations]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/quotations");
      const data = await response.json();

      if (data.success) {
        setQuotations(data.data);
        setFilteredQuotations(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quotations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  All Quotations
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage and view all your quotations
                </p>
              </div>
            </div>
            <Link
              href="/client-form"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center gap-2 justify-center"
            >
              <span className="text-xl">+</span>
              <span>New Quotation</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client name, company, quotation number, or phone..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            {search && (
              <p className="text-sm text-gray-600 mt-2">
                Found {filteredQuotations.length} result
                {filteredQuotations.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Quotations
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {quotations.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Value</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  ৳
                  {quotations
                    .reduce((sum, q) => sum + q.totalAmount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Latest Quotation
                </p>
                <p className="text-xl font-bold text-purple-600 mt-2">
                  {quotations[0]?.quotationNo || "N/A"}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quotations List */}
        <div className="space-y-4">
          {filteredQuotations.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-md text-center">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {search ? "No results found" : "No quotations yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {search
                  ? "Try adjusting your search terms"
                  : "Create your first quotation to get started"}
              </p>
              {!search && (
                <Link
                  href="/client-form"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Quotation
                </Link>
              )}
            </div>
          ) : (
            filteredQuotations.map((q) => (
              <div
                key={q._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row  lg:justify-between lg:items-center gap-6">
                    {/* Left Side - Client Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                              {q.quotationNo}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {new Date(q.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>

                          <h3 className="text-2xl font-bold text-gray-800 mb-1">
                            {q.clientName}
                          </h3>
                          <p className="text-lg text-gray-600 mb-2">
                            {q.companyName}
                          </p>

                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {q.address}
                            </p>
                            <p className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {q.phone}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Services ({q.services?.length || 0})
                        </p>
                        <div className="space-y-2">
                          {q.services?.map((service, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-3 rounded-lg border border-gray-200"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-gray-800 text-sm">
                                  {idx + 1}. {service.heading || "N/A"}
                                </span>
                                <span className="font-bold text-blue-600 text-sm whitespace-nowrap ml-2">
                                  {service.quantity} × ৳
                                  {service.price?.toLocaleString()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {service.details}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* right side content */}
                    <div className="flex-shrink-0 flex flex-col  gap-4 justify-items-center">
                      {/* Right Side - Amount */}
                      <div className="lg:w-64 flex-1">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center border-2 border-green-200">
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Total Amount
                          </p>
                          <p className="text-4xl font-bold text-green-600 mb-4">
                            ৳{q.totalAmount.toLocaleString()}
                          </p>
                          <div className="pt-4 border-t border-green-200">
                            <p className="text-xs text-gray-600">Valid until</p>
                            <p className="text-sm font-semibold text-gray-800 mt-1">
                              {new Date(q.validUntil).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <Link
                        href={`/client-form/edit/${q._id}`}
                        className=" flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Info */}
        {filteredQuotations.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            Showing {filteredQuotations.length} of {quotations.length} quotation
            {quotations.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
