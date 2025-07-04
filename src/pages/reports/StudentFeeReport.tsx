import React, { useState, useEffect } from 'react';
import { Download, Printer, DollarSign, AlertCircle } from 'lucide-react';
import { supabase, Student, StudentFee, Class } from '../../lib/supabase';

interface Props {
  filters: {
    classId: string;
    startDate: string;
    endDate: string;
    paymentStatus: string;
  };
  classes: Class[];
}

const StudentFeeReport: React.FC<Props> = ({ filters, classes }) => {
  const [feeData, setFeeData] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeeData();
  }, [filters]);

  const fetchFeeData = async () => {
    setLoading(true);
    setError('');
    
    try {
      let query = supabase
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

      // Filter by class
      if (filters.classId) {
        const { data: studentsInClass } = await supabase
          .from('students')
          .select('id')
          .eq('class_id', filters.classId);
        
        if (studentsInClass && studentsInClass.length > 0) {
          const studentIds = studentsInClass.map(s => s.id);
          query = query.in('student_id', studentIds);
        } else {
          // No students in selected class
          setFeeData([]);
          setLoading(false);
          return;
        }
      }

      // Filter by date range
      if (filters.startDate && filters.endDate) {
        query = query
          .gte('due_date', filters.startDate)
          .lte('due_date', filters.endDate);
      }

      // Filter by payment status
      if (filters.paymentStatus) {
        query = query.eq('status', filters.paymentStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFeeData(data || []);
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
    const headers = ['Student Name', 'Class', 'Fee Type', 'Amount', 'Due Date', 'Paid Date', 'Status', 'Payment Mode'];
    const csvData = feeData.map(fee => [
      fee.student?.full_name || '',
      fee.student?.class ? `${fee.student.class.name} - ${fee.student.class.section}` : '',
      fee.fee_type,
      fee.amount,
      fee.due_date,
      fee.payment_date || '',
      fee.status,
      fee.payment_mode || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-fee-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
    const totalAmount = feeData.reduce((sum, fee) => sum + fee.amount, 0);
    const paidAmount = feeData.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
    const unpaidAmount = feeData.filter(fee => fee.status === 'unpaid').reduce((sum, fee) => sum + fee.amount, 0);
    const partialAmount = feeData.filter(fee => fee.status === 'partial').reduce((sum, fee) => sum + fee.amount, 0);

    return {
      total: totalAmount,
      paid: paidAmount,
      unpaid: unpaidAmount,
      partial: partialAmount,
      collectionRate: totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(1) : '0',
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Student Fee Report</h2>
          <p className="mt-1 text-sm text-gray-500">
            Track fee payments and outstanding amounts from live database records
          </p>
        </div>
        
        {feeData.length > 0 && (
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
      ) : feeData.length === 0 ? (
        <div className="py-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Fee Records</h3>
          <p className="mt-1 text-sm text-gray-500">
            No fee records found for the selected criteria.
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
                    <dt className="truncate text-sm font-medium text-gray-500">Collected</dt>
                    <dd className="text-lg font-medium text-gray-900">${stats.paid.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Outstanding</dt>
                    <dd className="text-lg font-medium text-gray-900">${stats.unpaid.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Collection Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.collectionRate}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Table */}
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fee Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Paid Date
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
                {feeData.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{fee.student?.full_name}</div>
                        <div className="text-sm text-gray-500">{fee.student?.contact_phone}</div>
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
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {fee.payment_date ? new Date(fee.payment_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(fee.status)}`}>
                        {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {fee.payment_mode || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary by Student */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Summary by Student</h3>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Amount Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Amount Unpaid
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {Object.values(
                    feeData.reduce((acc, fee) => {
                      const studentId = fee.student_id;
                      if (!acc[studentId]) {
                        acc[studentId] = {
                          student: fee.student,
                          total: 0,
                          paid: 0,
                          unpaid: 0,
                        };
                      }
                      acc[studentId].total += fee.amount;
                      if (fee.status === 'paid') {
                        acc[studentId].paid += fee.amount;
                      } else {
                        acc[studentId].unpaid += fee.amount;
                      }
                      return acc;
                    }, {} as any)
                  ).map((summary: any, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {summary.student?.full_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {summary.student?.class ? `${summary.student.class.name} - ${summary.student.class.section}` : 'Not assigned'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${summary.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600">
                        ${summary.paid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600">
                        ${summary.unpaid.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentFeeReport;