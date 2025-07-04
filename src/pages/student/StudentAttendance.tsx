import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, Clock, Search, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { supabase, Student, Class } from '../../lib/supabase';
import { useUserEmail } from '../../hooks/useUserEmail';

interface StudentAttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  created_at: string;
  user_email: string;
  student?: Student;
  class?: Class;
}

const StudentAttendanceForm = () => {
  const userEmail = useUserEmail();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [existingAttendance, setExistingAttendance] = useState<StudentAttendanceRecord[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<StudentAttendanceRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchAttendanceHistory();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchStudentsAndAttendance();
    }
  }, [selectedClass, selectedDate]);

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

  const fetchStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      // Fetch students in the selected class
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(name, section)
        `)
        .eq('class_id', selectedClass)
        .order('full_name');

      if (studentsError) throw studentsError;

      // Fetch existing attendance for the selected date and class
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('student_attendance')
        .select('*')
        .eq('date', selectedDate)
        .eq('class_id', selectedClass);

      if (attendanceError) throw attendanceError;

      setStudents(studentsData || []);
      setExistingAttendance(attendanceData || []);

      // Initialize attendance data with existing records or defaults
      const initialAttendance: Record<string, 'present' | 'absent' | 'late'> = {};
      studentsData?.forEach(student => {
        const existing = attendanceData?.find(att => att.student_id === student.id);
        initialAttendance[student.id] = existing ? existing.status : 'present';
      });
      setAttendanceData(initialAttendance);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('student_attendance')
        .select(`
          *,
          student:students(
            full_name,
            contact_phone,
            contact_email
          ),
          class:classes(name, section)
        `)
        .order('date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAttendanceHistory(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateAttendanceStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!userEmail) {
      setError('User not authenticated');
      setIsSubmitting(false);
      return;
    }

    try {
      // Delete existing attendance for this date and class
      await supabase
        .from('student_attendance')
        .delete()
        .eq('date', selectedDate)
        .eq('class_id', selectedClass);

      // Insert new attendance records
      const recordsToInsert = Object.entries(attendanceData).map(([studentId, status]) => ({
        student_id: studentId,
        class_id: selectedClass,
        date: selectedDate,
        status,
        user_email: userEmail,
      }));

      const { error: insertError } = await supabase
        .from('student_attendance')
        .insert(recordsToInsert);

      if (insertError) throw insertError;

      setIsSuccess(true);
      
      // Refresh data
      fetchStudentsAndAttendance();
      fetchAttendanceHistory();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;

    try {
      const { error } = await supabase
        .from('student_attendance')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      fetchAttendanceHistory();
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter attendance history
  const filteredHistory = attendanceHistory.filter((record) => {
    const matchesSearch = record.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesClass = classFilter === '' || record.class_id === classFilter;
    const matchesDate = dateFilter === '' || record.date === dateFilter;
    return matchesSearch && matchesStatus && matchesClass && matchesDate;
  });

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

  return (
    <div className="pb-16 md:pb-0">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Student Attendance</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Eye className="mr-2 h-4 w-4" />
            {showHistory ? 'Hide History' : 'View History'}
          </button>
        </div>
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

      {/* Success message */}
      {isSuccess && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Attendance {showHistory ? 'updated' : 'recorded'} successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {!showHistory ? (
        /* Attendance Form */
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Calendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="class" className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <select
                  id="class"
                  name="class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - Section {cls.section}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Student List */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            </div>
          ) : students.length > 0 ? (
            <form onSubmit={handleSubmit}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Guardian
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {student.photo_url ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={student.photo_url} alt="" />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                                  {student.full_name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                              <div className="text-sm text-gray-500">{student.contact_email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {student.guardian_name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={() => updateAttendanceStatus(student.id, 'present')}
                              className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                                attendanceData[student.id] === 'present'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => updateAttendanceStatus(student.id, 'absent')}
                              className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                                attendanceData[student.id] === 'absent'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => updateAttendanceStatus(student.id, 'late')}
                              className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                                attendanceData[student.id] === 'late'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Late
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-right sm:px-6">
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
                      Saving...
                    </>
                  ) : (
                    'Save Attendance'
                  )}
                </button>
              </div>
            </form>
          ) : selectedClass && selectedDate ? (
            <div className="px-4 py-10 text-center sm:px-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Calendar className="h-8 w-8 text-gray-400" aria-hidden="true" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No students are enrolled in the selected class.
              </p>
            </div>
          ) : (
            <div className="px-4 py-10 text-center sm:px-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Calendar className="h-8 w-8 text-gray-400" aria-hidden="true" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Select Date and Class</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a date and class to mark student attendance.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Attendance History */
        <div className="space-y-6">
          {/* Filters */}
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Search students..."
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
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>

              <select
                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.section}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by date"
              />

              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setClassFilter('');
                  setDateFilter('');
                }}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear
              </button>
            </div>
          </div>

          {/* History Table */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Class
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
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{record.student?.full_name}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {record.class ? `${record.class.name} - ${record.class.section}` : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <div className="flex items-center">
                            {getStatusIcon(record.status)}
                            <span className={`ml-2 inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(record.status)}`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                        No attendance records found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredHistory.length}</span> attendance records
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendanceForm;