import React, { useState, useEffect } from 'react';
import { Download, Printer, DollarSign, Users } from 'lucide-react';
import { supabase, Teacher, TeacherSalary } from '../../lib/supabase';

interface Props {
  filters: {
    teacherId: string;
    startDate: string;
    endDate: string;
    paymentStatus: string;
  };
  teachers: Teacher[];
}

const TeacherSalaryReport: React.FC<Props> = ({ filters, teachers }) => {
  const [salaryData, setSalaryData] = useState<TeacherSalary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSalaryData();
  }, [filters]);

  const fetchSalaryData = async () => {
    setLoading(true);
    setError('');

    try {
      let query = supabase
        .from('teacher_salaries')
        .select(`
          *,
          teacher:teachers(full_name, contact_email)
        `)
        .order('created_at', { ascending: false });

      if (filters.teacherId) {
        query = query.eq('teacher_id', filters.teacherId);
      }

      if (filters.startDate && filters.endDate) {
        query = query
          .gte('payment_date', filters.startDate)
          .lte('payment_date', filters.endDate);
      }

      if (filters.paymentStatus) {
        query = query.eq('status', filters.paymentStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSalaryData(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    window.print();
  };

  const downloadCSV = () => {
    const headers = ['Teacher Name', 'Email', 'Month/Year', 'Amount', 'Payment Date', 'Status', 'Payment Mode'];
    const csvData = salaryData.map(salary => [
      salary.teacher?.full_name || '',
      salary.teacher?.contact_email || '',
      salary.month_year,
      salary.amount,
      salary.payment_date || '',
      salary.status,
      salary.payment_mode || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teacher-salary-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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

  const calculateStats = () => {
    const totalAmount = salaryData.reduce((sum, salary) => sum + salary.amount, 0);
    const paidAmount = salaryData.filter(salary => salary.status === 'paid').reduce((sum, salary) => sum + salary.amount, 0);
    const unpaidAmount = salaryData.filter(salary => salary.status === 'unpaid').reduce((sum, salary) => sum + salary.amount, 0);
    const totalRecords = salaryData.length;
    const paidRecords = salaryData.filter(salary => salary.status === 'paid').length;

    return {
      total: totalAmount,
      paid: paidAmount,
      unpaid: unpaidAmount,
      totalRecords,
      paidRecords,
      paymentRate: totalRecords > 0 ? ((paidRecords / totalRecords) * 100).toFixed(1) : '0',
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Teacher Salary Report</h2>
          <p className="mt-1 text-sm text-gray-500">
            Monitor teacher salary payments and outstanding amounts
          </p>
        </div>
        
        {salaryData.length > 0 && (
          <div className="flex space-x-3">
            <button
              onClick={downloadCSV}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </button>
            <button
              onClick={generatePDF}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      ) : salaryData.length === 0 ? (
        <div className="py-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Salary Records</h3>
          <p className="mt-1 text-sm text-gray-500">
            No salary records found for the selected criteria.
          </p>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Total Amount</dt>
                    <dd className="text-lg font-medium text-gray-900">${stats.total.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Paid</dt>
                    <dd className="text-lg font-medium text-gray-900">${stats.paid.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Unpaid</dt>
                    <dd className="text-lg font-medium text-gray-900">${stats.unpaid.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Payment Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.paymentRate}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Table */}
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Month/Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Payment Mode
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {salaryData.map((salary, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{salary.teacher?.full_name}</div>
                        <div className="text-sm text-gray-500">{salary.teacher?.contact_email}</div>
                      </div>
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
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {salary.payment_mode || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherSalaryReport;