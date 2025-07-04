import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, Clock, Search, Edit, Trash2 } from 'lucide-react';
import { supabase, Teacher, TeacherAttendance } from '../../lib/supabase';
import { useUserEmail } from '../../hooks/useUserEmail';

const TeacherAttendanceForm = () => {
  const userEmail = useUserEmail();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceData, setAttendanceData] = useState<TeacherAttendance[]>([]);
  const [existingAttendance, setExistingAttendance] = useState<TeacherAttendance[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadAttendanceForDate();
    }
  }, [selectedDate]);

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

  const loadAttendanceForDate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teacher_attendance')
        .select(`
          *,
          teacher:teachers(full_name)
        `)
        .eq('date', selectedDate);

      if (error) throw error;
      
      setExistingAttendance(data || []);
      
      // Initialize attendance data with existing records or defaults
      const initialData = teachers.map(teacher => {
        const existing = data?.find(att => att.teacher_id === teacher.id);
        return existing || {
          id: `temp-${teacher.id}`,
          teacher_id: teacher.id,
          date: selectedDate,
          status: 'present' as const,
          created_at: new Date().toISOString(),
          user_email: userEmail,
          teacher: teacher
        };
      });
      
      setAttendanceData(initialData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAttendanceStatus = (teacherId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceData(prevData =>
      prevData.map(item =>
        item.teacher_id === teacherId
          ? { ...item, status }
          : item
      )
    );
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
      // Delete existing attendance for this date
      await supabase
        .from('teacher_attendance')
        .delete()
        .eq('date', selectedDate);

      // Insert new attendance records
      const recordsToInsert = attendanceData.map(item => ({
        teacher_id: item.teacher_id,
        date: selectedDate,
        status: item.status,
        user_email: userEmail,
      }));

      const { error: insertError } = await supabase
        .from('teacher_attendance')
        .insert(recordsToInsert);

      if (insertError) throw insertError;

      setIsSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);

      // Reload attendance data
      loadAttendanceForDate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRecord = async (recordId: string, status: 'present' | 'absent' | 'late') => {
    try {
      const { error } = await supabase
        .from('teacher_attendance')
        .update({ status })
        .eq('id', recordId);

      if (error) throw error;

      // Update local state
      setAttendanceData(prevData =>
        prevData.map(item =>
          item.id === recordId ? { ...item, status } : item
        )
      );

      setEditingRecord(null);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;

    try {
      const { error } = await supabase
        .from('teacher_attendance')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      // Remove from local state
      setAttendanceData(prevData => prevData.filter(item => item.id !== recordId));
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter teachers based on search query
  const filteredAttendance = attendanceData.filter((attendance) => {
    const teacher = teachers.find(t => t.id === attendance.teacher_id);
    return teacher?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="pb-16 md:pb-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Attendance</h1>
        <p className="mt-1 text-sm text-gray-500">
          Record daily attendance for teachers
        </p>
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

      {/* Form */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

            <div className="flex-1 max-w-sm">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search Teachers
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Search by name..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Success message */}
        {isSuccess && (
          <div className="mx-4 mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Teacher attendance updated successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Attendance list */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          </div>
        ) : filteredAttendance.length > 0 ? (
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Teacher
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Subjects
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredAttendance.map((attendance, index) => {
                    const teacher = teachers.find(t => t.id === attendance.teacher_id);
                    if (!teacher) return null;
                    
                    const isExisting = existingAttendance.some(ea => ea.teacher_id === attendance.teacher_id);
                    
                    return (
                      <tr key={index}>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {teacher.photo_url ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={teacher.photo_url} alt="" />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                                  {teacher.full_name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{teacher.full_name}</div>
                              <div className="text-sm text-gray-500">{teacher.contact_email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {teacher.subjects.slice(0, 2).map((subject) => (
                              <span
                                key={subject}
                                className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800"
                              >
                                {subject}
                              </span>
                            ))}
                            {teacher.subjects.length > 2 && (
                              <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                                +{teacher.subjects.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {editingRecord === attendance.id ? (
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => handleEditRecord(attendance.id, 'present')}
                                className="inline-flex items-center rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditRecord(attendance.id, 'absent')}
                                className="inline-flex items-center rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-800"
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditRecord(attendance.id, 'late')}
                                className="inline-flex items-center rounded-md bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800"
                              >
                                Late
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-3">
                              <button
                                type="button"
                                onClick={() => updateAttendanceStatus(attendance.teacher_id, 'present')}
                                className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                                  attendance.status === 'present'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => updateAttendanceStatus(attendance.teacher_id, 'absent')}
                                className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                                  attendance.status === 'absent'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => updateAttendanceStatus(attendance.teacher_id, 'late')}
                                className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                                  attendance.status === 'late'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                Late
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          {isExisting && (
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => setEditingRecord(editingRecord === attendance.id ? null : attendance.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRecord(attendance.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
        ) : (
          <div className="px-4 py-10 text-center sm:px-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Calendar className="h-8 w-8 text-gray-400" aria-hidden="true" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'No teachers match your search criteria.' : 'No teachers available for attendance.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendanceForm;