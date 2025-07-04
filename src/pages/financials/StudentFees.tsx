import React, { useState, useEffect } from 'react';
import { PlusCircle, DollarSign, FileText, Check, Search, Download, Edit, Trash2 } from 'lucide-react';
import { supabase, Student, StudentFee, Class } from '../../lib/supabase';

const StudentFees = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('');
  const [showAddFeeForm, setShowAddFeeForm] = useState(false);
  const [editingFee, setEditingFee] = useState<StudentFee | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);

  const [formData, setFormData] = useState({
    student_id: '',
    fee_type: '',
    amount: '',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payment_date: '',
    status: 'unpaid' as 'paid' | 'unpaid' | 'partial',
    payment_mode: '' as 'cash' | 'bank' | 'online' | '',
    description: '',
  });

  const feeTypes = [
    'Tuition Fee',
    'Lab Fee',
    'Library Fee',
    'Sports Fee',
    'Transport Fee',
    'Examination Fee',
    'Activity Fee',
    'Uniform Fee',
    'Books Fee',
    'Other',
  ];

  useEffect(() => {
    fetchStudents();
    fetchFees();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(name, section)
        `)
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchFees = async () => {
    try {
      const { data, error } = await supabase
        .from('student_fees')
        .select(`
          *,
          student:students(
            full_name,
            contact_phone,
            contact_email,
            class:classes(name, section)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFees(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      fee_type: '',
      amount: '',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      payment_date: '',
      status: 'unpaid',
      payment_mode: '',
      description: '',
    });
    setEditingFee(null);
  };

  const handleEdit = (fee: StudentFee) => {
    setEditingFee(fee);
    setFormData({
      student_id: fee.student_id,
      fee_type: fee.fee_type,
      amount: fee.amount.toString(),
      due_date: fee.due_date,
      payment_date: fee.payment_date || '',
      status: fee.status,
      payment_mode: fee.payment_mode || '',
      description: fee.description || '',
    });
    setShowAddFeeForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee record?')) return;

    try {
      const { error } = await supabase
        .from('student_fees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFees(fees.filter(fee => fee.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setFormData({
      ...formData,
      student_id: studentId,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const feeData = {
        student_id: formData.student_id,
        fee_type: formData.fee_type,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        payment_date: formData.payment_date || null,
        status: formData.status,
        payment_mode: formData.payment_mode || null,
        description: formData.description || null,
      };

      if (editingFee) {
        // Update existing fee
        const { data, error: updateError } = await supabase
          .from('student_fees')
          .update(feeData)
          .eq('id', editingFee.id)
          .select(`
            *,
            student:students(
              full_name,
              contact_phone,
              contact_email,
              class:classes(name, section)
            )
          `);

        if (updateError) throw updateError;

        setFees(fees.map(fee => 
          fee.id === editingFee.id ? data[0] : fee
        ));
      } else {
        // Insert new fee
        const { data, error: insertError } = await supabase
          .from('student_fees')
          .insert([feeData])
          .select(`
            *,
            student:students(
              full_name,
              contact_phone,
              contact_email,
              class:classes(name, section)
            )
          `);

        if (insertError) throw insertError;

        setFees([...data, ...fees]);
      }

      setShowAddFeeForm(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAsPaid = async (feeId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_fees')
        .update({ 
          status: 'paid', 
          payment_date: new Date().toISOString().split('T')[0] 
        })
        .eq('id', feeId)
        .select(`
          *,
          student:students(
            full_name,
            contact_phone,
            contact_email,
            class:classes(name, section)
          )
        `);

      if (error) throw error;

      setFees(fees.map(fee => 
        fee.id === feeId ? data[0] : fee
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter fees based on search query, status, and class
  const filteredFees = fees.filter((fee) => {
    const student = fee.student;
    const matchesSearch = student?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fee.fee_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fee.status === statusFilter;
    const matchesClass = classFilter === '' || student?.class?.name === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateStats = () => {
    const totalAmount = filteredFees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidAmount = filteredFees.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
    const unpaidAmount = filteredFees.filter(fee => fee.status === 'unpaid').reduce((sum, fee) => sum + fee.amount, 0);
    const partialAmount = filteredFees.filter(fee => fee.status === 'partial').reduce((sum, fee) => sum + fee.amount, 0);

    return {
      total: totalAmount,
      paid: paidAmount,
      unpaid: unpaidAmount,
      partial: partialAmount,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-16 md:pb-0">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900">Student Fees</h1>
        <button
          onClick={() => {
            resetForm();
            setShowAddFeeForm(true);
          }}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <PlusCircle className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
          Add New Fee
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Fee Form */}
      {showAddFeeForm && (
        <div className="mb-6 overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {editingFee ? 'Edit Fee' : 'Add New Fee'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {editingFee ? 'Update the fee details.' : 'Fill in the details to add a new fee.'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="border-b border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
                  Student *
                </label>
                <select
                  id="student_id"
                  name="student_id"
                  value={formData.student_id}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  required
                  disabled={!!editingFee}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} {student.class && `- ${student.class.name} ${student.class.section}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="fee_type" className="block text-sm font-medium text-gray-700">
                  Fee Type *
                </label>
                <select
                  id="fee_type"
                  name="fee_type"
                  value={formData.fee_type}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Select fee type</option>
                  {feeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount *
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="due_date"
                  id="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              {formData.status === 'paid' && (
                <>
                  <div className="sm:col-span-3">
                    <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      name="payment_date"
                      id="payment_date"
                      value={formData.payment_date}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="payment_mode" className="block text-sm font-medium text-gray-700">
                      Payment Mode *
                    </label>
                    <select
                      id="payment_mode"
                      name="payment_mode"
                      value={formData.payment_mode}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Select payment mode</option>
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="online">Online Payment</option>
                    </select>
                  </div>
                </>
              )}

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Additional notes about this fee..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddFeeForm(false);
                  resetForm();
                }}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="mr-3 -ml-1 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingFee ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingFee ? 'Update Fee' : 'Add Fee'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and filters */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Search students or fee types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
          </select>

          <select
            className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.name}>
                {cls.name} - {cls.section}
              </option>
            ))}
          </select>

          <button className="inline-flex items-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Download className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
            Export
          </button>
        </div>
      </div>

      {/* Fee list */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="min-w-full divide-y divide-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Class
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fee Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredFees.length > 0 ? (
                  filteredFees.map((fee: StudentFee) => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {fee.student?.photo_url ? (
                              <img className="h-10 w-10 rounded-full object-cover" src={fee.student.photo_url} alt="" />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                                {fee.student?.full_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{fee.student?.full_name}</div>
                            <div className="text-sm text-gray-500">{fee.student?.contact_phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {fee.student?.class ? `${fee.student.class.name} - ${fee.student.class.section}` : 'Not assigned'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {fee.fee_type}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        ${fee.amount.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(fee.due_date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(fee.status)}`}>
                          {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(fee)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(fee.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          {fee.status === 'unpaid' && (
                            <button 
                              onClick={() => markAsPaid(fee.id)}
                              className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 hover:bg-green-100"
                            >
                              <DollarSign className="mr-1 h-4 w-4" />
                              Mark Paid
                            </button>
                          )}
                          {fee.status === 'paid' && (
                            <button className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100">
                              <FileText className="mr-1 h-4 w-4" />
                              Receipt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                      No fees found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Fee Overview */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Fee Overview</h3>
              <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900">${stats.total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Collected</p>
                  <p className="text-lg font-semibold text-green-600">${stats.paid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Outstanding</p>
                  <p className="text-lg font-semibold text-red-600">${stats.unpaid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Partial</p>
                  <p className="text-lg font-semibold text-yellow-600">${stats.partial.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFees;