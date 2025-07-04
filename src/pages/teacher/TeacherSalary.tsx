import React, { useState, useEffect } from 'react';
import { PlusCircle, DollarSign, FileText, Check, Search, Download, Edit, Trash2 } from 'lucide-react';
import { supabase, Teacher, TeacherSalary } from '../../lib/supabase';

const TeacherSalaryModule = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [salaries, setSalaries] = useState<TeacherSalary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddSalaryForm, setShowAddSalaryForm] = useState(false);
  const [editingSalary, setEditingSalary] = useState<TeacherSalary | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    teacher_id: '',
    amount: '',
    payment_date: '',
    month_year: '',
    status: 'unpaid' as 'paid' | 'unpaid',
    payment_mode: '' as 'cash' | 'bank' | 'online' | '',
  });

  useEffect(() => {
    fetchTeachers();
    fetchSalaries();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setTeachers(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchSalaries = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_salaries')
        .select(`
          *,
          teacher:teachers(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSalaries(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      teacher_id: '',
      amount: '',
      payment_date: '',
      month_year: '',
      status: 'unpaid',
      payment_mode: '',
    });
    setEditingSalary(null);
  };

  const handleEdit = (salary: TeacherSalary) => {
    setEditingSalary(salary);
    setFormData({
      teacher_id: salary.teacher_id,
      amount: salary.amount.toString(),
      payment_date: salary.payment_date || '',
      month_year: salary.month_year,
      status: salary.status,
      payment_mode: salary.payment_mode || '',
    });
    setShowAddSalaryForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this salary record?')) return;

    try {
      const { error } = await supabase
        .from('teacher_salaries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSalaries(salaries.filter(salary => salary.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const salaryData = {
        teacher_id: formData.teacher_id,
        amount: parseFloat(formData.amount),
        payment_date: formData.payment_date || null,
        month_year: formData.month_year,
        status: formData.status,
        payment_mode: formData.payment_mode || null,
      };

      if (editingSalary) {
        // Update existing salary
        const { data, error: updateError } = await supabase
          .from('teacher_salaries')
          .update(salaryData)
          .eq('id', editingSalary.id)
          .select(`
            *,
            teacher:teachers(full_name)
          `);

        if (updateError) throw updateError;

        setSalaries(salaries.map(salary => 
          salary.id === editingSalary.id ? data[0] : salary
        ));
      } else {
        // Insert new salary
        const { data, error: insertError } = await supabase
          .from('teacher_salaries')
          .insert([salaryData])
          .select(`
            *,
            teacher:teachers(full_name)
          `);

        if (insertError) throw insertError;

        setSalaries([...data, ...salaries]);
      }

      setShowAddSalaryForm(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSalaryStatus = async (id: string, status: 'paid' | 'unpaid', payment_date?: string) => {
    try {
      const { data, error } = await supabase
        .from('teacher_salaries')
        .update({ 
          status, 
          payment_date: status === 'paid' ? (payment_date || new Date().toISOString().split('T')[0]) : null 
        })
        .eq('id', id)
        .select(`
          *,
          teacher:teachers(full_name)
        `);

      if (error) throw error;

      setSalaries(salaries.map(salary => 
        salary.id === id ? data[0] : salary
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter salaries based on search query and status
  const filteredSalaries = salaries.filter((salary) => {
    const matchesSearch = salary.teacher?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || '';
    const matchesStatus = statusFilter === 'all' || salary.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Teacher Salaries</h1>
        <button
          onClick={() => {
            resetForm();
            setShowAddSalaryForm(true);
          }}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <PlusCircle className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
          Record Salary
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

      {/* Add/Edit Salary Form */}
      {showAddSalaryForm && (
        <div className="mb-6 overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {editingSalary ? 'Edit Salary Payment' : 'Record Salary Payment'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {editingSalary ? 'Update the salary payment details.' : 'Fill in the details to record a salary payment.'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="border-b border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700">
                  Teacher *
                </label>
                <select
                  id="teacher_id"
                  name="teacher_id"
                  value={formData.teacher_id}
                  onChange={handleChange}
                  required
                  disabled={!!editingSalary}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="month_year" className="block text-sm font-medium text-gray-700">
                  Month/Year *
                </label>
                <input
                  type="month"
                  name="month_year"
                  id="month_year"
                  value={formData.month_year}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
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
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddSalaryForm(false);
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
                    {editingSalary ? 'Updating...' : 'Recording...'}
                  </>
                ) : (
                  editingSalary ? 'Update Salary' : 'Record Salary'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and filters */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow sm:flex sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Search by teacher name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="mt-3 flex sm:mt-0">
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-500">Status:</span>
            <select
              className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Salary list */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="min-w-full divide-y divide-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Teacher
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Month/Year
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Payment Date
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
                {filteredSalaries.length > 0 ? (
                  filteredSalaries.map((salary: TeacherSalary) => (
                    <tr key={salary.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{salary.teacher?.full_name}</div>
                        <div className="text-sm text-gray-500">ID: {salary.teacher_id.substring(0, 8)}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {salary.month_year}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        ${salary.amount.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {salary.payment_date ? new Date(salary.payment_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(salary.status)}`}>
                          {salary.status.charAt(0).toUpperCase() + salary.status.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleEdit(salary)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(salary.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          {salary.status === 'unpaid' && (
                            <button 
                              onClick={() => updateSalaryStatus(salary.id, 'paid')}
                              className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 hover:bg-green-100"
                            >
                              <DollarSign className="mr-1 h-4 w-4" />
                              Mark Paid
                            </button>
                          )}
                          {salary.status === 'paid' && (
                            <button className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100">
                              <FileText className="mr-1 h-4 w-4" />
                              View Receipt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                      No salary records found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Salary Overview */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Salary Overview</h3>
              <div className="mt-2 flex space-x-6">
                <div>
                  <p className="text-xs text-gray-500">Total Paid</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${filteredSalaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Unpaid</p>
                  <p className="text-lg font-semibold text-red-600">
                    ${filteredSalaries.filter(s => s.status === 'unpaid').reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <button className="inline-flex items-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <Download className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSalaryModule;