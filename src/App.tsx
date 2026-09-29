import React, { useState, useEffect } from 'react';

// Types
interface SalesRecord {
  id: string;
  customerName: string;
  businessName: string;
  phoneNumber: string;
  service: string;
  description: string;
  agreedPrice: number;
  amountPaid: number;
  deadline: string;
}

// Service options
const SERVICES = [
  'Website',
  'Flyer',
  'Sika Boafo Setup',
  'Mobile Printer',
  'Android App',
  'Web App',
  'Graphic Design',
  'Business Registration',
  'Other',
];

// Sample data
const SAMPLE_DATA: SalesRecord[] = [
  {
    id: '1',
    customerName: 'Adwoa Ventures',
    businessName: '',
    phoneNumber: '',
    service: 'Website',
    description: '',
    agreedPrice: 800,
    amountPaid: 400,
    deadline: '',
  },
  {
    id: '2',
    customerName: 'Kwame',
    businessName: '',
    phoneNumber: '',
    service: 'Flyer',
    description: '',
    agreedPrice: 100,
    amountPaid: 100,
    deadline: '',
  },
  {
    id: '3',
    customerName: 'Ama Shop',
    businessName: '',
    phoneNumber: '',
    service: 'Sika Boafo Setup',
    description: '',
    agreedPrice: 200,
    amountPaid: 200,
    deadline: '',
  },
  {
    id: '4',
    customerName: 'Kofi',
    businessName: '',
    phoneNumber: '',
    service: 'Mobile Printer',
    description: '',
    agreedPrice: 450,
    amountPaid: 0,
    deadline: '',
  },
];

const TARGET = 3000;

// Helper functions
function formatCurrency(amount: number): string {
  return `GH₵${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStatus(record: SalesRecord): string {
  const balance = record.agreedPrice - record.amountPaid;
  if (balance <= 0) return 'Paid';
  if (record.amountPaid > 0) return 'Partially Paid';
  return 'Unpaid';
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-700';
    case 'Partially Paid':
      return 'bg-yellow-100 text-yellow-700';
    case 'Unpaid':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Main App Component
export default function App() {
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SalesRecord | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    businessName: '',
    phoneNumber: '',
    service: '',
    description: '',
    agreedPrice: '',
    amountPaid: '',
    deadline: '',
  });

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('tanscode_records');
    if (stored) {
      setRecords(JSON.parse(stored));
    } else {
      // Load sample data
      setRecords(SAMPLE_DATA);
      localStorage.setItem('tanscode_records', JSON.stringify(SAMPLE_DATA));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (records.length > 0) {
      localStorage.setItem('tanscode_records', JSON.stringify(records));
    }
  }, [records]);

  // Calculations
  const totalCollected = records.reduce((sum, r) => sum + r.amountPaid, 0);
  const totalOutstanding = records.reduce((sum, r) => sum + (r.agreedPrice - r.amountPaid), 0);
  const progress = Math.min((totalCollected / TARGET) * 100, 100);

  // Open add modal
  const openAddModal = () => {
    setEditingRecord(null);
    setFormData({
      customerName: '',
      businessName: '',
      phoneNumber: '',
      service: '',
      description: '',
      agreedPrice: '',
      amountPaid: '',
      deadline: '',
    });
    setErrors({});
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (record: SalesRecord) => {
    setEditingRecord(record);
    setFormData({
      customerName: record.customerName,
      businessName: record.businessName,
      phoneNumber: record.phoneNumber,
      service: record.service,
      description: record.description,
      agreedPrice: record.agreedPrice.toString(),
      amountPaid: record.amountPaid.toString(),
      deadline: record.deadline,
    });
    setErrors({});
    setShowModal(true);
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required.';
    }
    if (!formData.service) {
      newErrors.service = 'Please select a service.';
    }
    if (!formData.agreedPrice || parseFloat(formData.agreedPrice) <= 0) {
      newErrors.agreedPrice = 'Agreed price must be greater than 0.';
    }
    if (formData.amountPaid && parseFloat(formData.amountPaid) < 0) {
      newErrors.amountPaid = 'Amount paid cannot be negative.';
    }
    if (
      formData.agreedPrice &&
      formData.amountPaid &&
      parseFloat(formData.amountPaid) > parseFloat(formData.agreedPrice)
    ) {
      newErrors.amountPaid = 'Amount paid cannot exceed agreed price.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save record
  const handleSave = () => {
    if (!validate()) return;

    const agreedPrice = parseFloat(formData.agreedPrice) || 0;
    let amountPaid = parseFloat(formData.amountPaid) || 0;
    if (amountPaid > agreedPrice) amountPaid = agreedPrice;
    if (amountPaid < 0) amountPaid = 0;

    const newRecord: SalesRecord = {
      id: editingRecord ? editingRecord.id : generateId(),
      customerName: formData.customerName.trim(),
      businessName: formData.businessName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      service: formData.service,
      description: formData.description.trim(),
      agreedPrice,
      amountPaid,
      deadline: formData.deadline,
    };

    if (editingRecord) {
      setRecords(records.map((r) => (r.id === editingRecord.id ? newRecord : r)));
    } else {
      setRecords([...records, newRecord]);
    }

    setShowModal(false);
  };

  // Delete record
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setRecords(records.filter((r) => r.id !== id));
    }
  };

  // Update form field
  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">TANSCODE</h1>
          <h2 className="text-xl md:text-2xl font-semibold mt-1 opacity-90">SALES RECORD</h2>
          <p className="text-lg mt-2 italic opacity-80">"Build. Solve. Earn."</p>
          <p className="text-sm mt-1 opacity-70">7-Day Money Making Tracker</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Target</p>
            <p className="text-2xl md:text-3xl font-bold text-indigo-700 mt-1">{formatCurrency(TARGET)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Collected</p>
            <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1">{formatCurrency(totalCollected)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Outstanding</p>
            <p className="text-2xl md:text-3xl font-bold text-red-500 mt-1">{formatCurrency(totalOutstanding)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">PROGRESS</span>
            <span className="text-sm font-medium text-indigo-700">
              {formatCurrency(totalCollected)} / {formatCurrency(TARGET)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-right text-sm font-medium text-gray-600 mt-1">{progress.toFixed(1)}%</p>
        </div>

        {/* Add Record Button */}
        <div className="mb-6">
          <button
            onClick={openAddModal}
            className="w-full md:w-auto bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-3 px-8 rounded-xl shadow-sm transition-colors duration-200 text-lg"
          >
            + ADD RECORD
          </button>
        </div>

        {/* Customer Records */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">CUSTOMER RECORDS</h3>
          </div>

          {records.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-lg">No customer records yet.</p>
              <p className="text-gray-400 mt-1">Click + Add Record to record your first customer.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">What They Want</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Paid</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Balance</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {records.map((record, index) => {
                      const balance = record.agreedPrice - record.amountPaid;
                      const status = getStatus(record);
                      return (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-gray-800">{record.customerName}</p>
                            {record.businessName && (
                              <p className="text-xs text-gray-500">{record.businessName}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{record.service}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                            {formatCurrency(record.agreedPrice)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                            {formatCurrency(record.amountPaid)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-red-500">
                            {formatCurrency(balance > 0 ? balance : 0)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => openEditModal(record)}
                                className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                              >
                                EDIT
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                              >
                                DELETE
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {records.map((record, index) => {
                  const balance = record.agreedPrice - record.amountPaid;
                  const status = getStatus(record);
                  return (
                    <div key={record.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-800 text-base">{record.customerName}</p>
                          {record.businessName && (
                            <p className="text-sm text-gray-500">{record.businessName}</p>
                          )}
                        </div>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Service:</span>
                          <p className="font-medium text-gray-800">{record.service}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <p className="font-medium text-gray-800">{formatCurrency(record.agreedPrice)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Paid:</span>
                          <p className="font-medium text-green-600">{formatCurrency(record.amountPaid)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Balance:</span>
                          <p className="font-medium text-red-500">{formatCurrency(balance > 0 ? balance : 0)}</p>
                        </div>
                        {record.deadline && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Deadline:</span>
                            <p className="font-medium text-gray-800">{record.deadline}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => openEditModal(record)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                {editingRecord ? 'Edit Record' : 'Add New Record'}
              </h3>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => updateField('customerName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g. Adwoa Ventures"
                />
                {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => updateField('phoneNumber', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What They Want <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => updateField('service', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  <option value="">Select a service...</option>
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="e.g. Customer wants a simple business website with WhatsApp button."
                />
              </div>

              {/* Price & Paid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agreed Price (GH₵) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.agreedPrice}
                    onChange={(e) => updateField('agreedPrice', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {errors.agreedPrice && <p className="text-red-500 text-xs mt-1">{errors.agreedPrice}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (GH₵)</label>
                  <input
                    type="number"
                    value={formData.amountPaid}
                    onChange={(e) => updateField('amountPaid', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {errors.amountPaid && <p className="text-red-500 text-xs mt-1">{errors.amountPaid}</p>}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => updateField('deadline', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-lg bg-indigo-700 text-white font-medium text-sm hover:bg-indigo-800 transition-colors"
              >
                SAVE RECORD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400">
        <p>TANSCODE SALES RECORD &copy; 2025</p>
      </footer>
    </div>
  );
}
