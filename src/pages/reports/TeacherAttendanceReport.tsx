import React, { useState, useEffect } from 'react';
import { Download, Printer, Calendar, Check, X, Clock } from 'lucide-react';
import { supabase, Teacher, TeacherAttendance } from '../../lib/supabase';

interface Props {
  filters: {
    teacherId: string;
    startDate: string;
    endDate: string;
  };
  teachers: Teacher[];
}

const TeacherAttendanceReport: React.FC<Props> = ({ filters, teachers }) => {
  const [attendanceData, setAttendanceData] = useState<TeacherAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      fetchAttendanceData();
    }
  }, [filters]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    setError('');

    try {
      let query = supabase
        .from('teacher_attendance')
        .select(`
          *,
          teacher:teachers(full_name, contact_email)
        `)
        .gte('date', filters.startDate)
        .lte('date', filters.endDate)
        .order('date', { ascending: false });

      if (filters.teacherId) {
        query = query.eq('teacher_id', filters.teacherId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAttendanceData(data || []);
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
    const headers = ['Date', 'Teacher Name', 'Email', 'Status'];
    const csvData = attendanceData.map(record => [
      record.date,
      record.teacher?.full_name || '',
      record.teacher?.contact_email || '',
      record.status
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teacher-attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <X className="h-4 w-4 text-red-600" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateStats = () => {
    const totalRecords = attendanceData.length;
    const presentCount = attendanceData.filter(r => r.status === 'present').length;
    const absentCount = attendanceData.filter(r => r.status === 'absent').length;
    const lateCount = attendanceData.filter(r => r.status === 'late').length;

    return {
      total: totalRecords,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      presentPercentage: totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : '0',
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Teacher Attendance Report</h2>
          <p className="mt-1 text-sm text-gray-500">
            {filters.startDate && filters.endDate
              ? `${new Date(filters.startDate).toLocaleDateString()} - ${new Date(filters.endDate).toLocaleDateString()}`
              : 'Select date range to generate report'}
          </p>
        </div>
        
        {attendanceData.length > 0 && (
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

      {!filters.startDate || !filters.endDate ? (
        <div className="py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Date Range Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select a start and end date to generate the attendance report.
          </p>
        </div>
      ) : loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      ) : attendanceData.length === 0 ? (
        <div className="py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Attendance Records</h3>
          <p className="mt-1 text-sm text-gray-500">
            No attendance records found for the selected criteria.
          </p>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Total Records</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Present</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.present}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Absent</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.absent}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Attendance Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.presentPercentage}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {attendanceData.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {record.teacher?.full_name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {record.teacher?.contact_email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center">
                        {getStatusIcon(record.status)}
                        <span className={`ml-2 inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
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

export default TeacherAttendanceReport;