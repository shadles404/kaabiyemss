import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Search, UserPlus, Filter } from 'lucide-react';
import { supabase, Student, Class } from '../../lib/supabase';

const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchStudents();
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setStudents(students.filter(student => student.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter students based on search query and class filter
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.contact_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass ? student.class_id === filterClass : true;
    return matchesSearch && matchesClass;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <button
          onClick={() => navigate('/students/new')}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <UserPlus className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
          Add New Student
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

      {/* Search and filters */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow sm:flex sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
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
        
        <div className="mt-3 flex sm:mt-0">
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-gray-400" />
            <select
              className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.section}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student list */}
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
                    Guardian
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Admission Date
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student: Student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3">
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
                            <div className="text-sm text-gray-500">ID: {student.id.substring(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {student.class ? `${student.class.name} - ${student.class.section}` : 'Not assigned'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {student.guardian_name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {student.contact_phone}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(student.admission_date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link to={`/students/${student.id}`} className="text-indigo-600 hover:text-indigo-900">
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link to={`/students/${student.id}/edit`} className="text-blue-600 hover:text-blue-900">
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(student.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                      No students found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredStudents.length}</span> students
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentList;