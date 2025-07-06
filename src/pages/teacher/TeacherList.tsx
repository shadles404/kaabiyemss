import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Search, UserPlus, Filter, Mail, Phone } from 'lucide-react';
import { supabase, Teacher } from '../../lib/supabase';

const TeacherList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [error, setError] = useState('');

  const availableSubjects = [
    'Mathematics', 'English', 'Science', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Physical Education',
    'Art', 'Music', 'Literature', 'Social Studies', 'Economics'
  ];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTeachers(teachers.filter(teacher => teacher.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter teachers based on search query and subject filter
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch = teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.contact_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject ? teacher.subjects.includes(filterSubject) : true;
    return matchesSearch && matchesSubject;
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
        <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
        <button
          onClick={() => navigate('/teachers/new')}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <UserPlus className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
          Add New Teacher
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
            placeholder="Search teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="mt-3 flex sm:mt-0">
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-gray-400" />
            <select
              className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {availableSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Teacher list */}
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
                    Subjects
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Qualification
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Salary
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher: Teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3">
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
                            <div className="text-sm text-gray-500">ID: {teacher.id.substring(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.slice(0, 3).map((subject) => (
                            <span
                              key={subject}
                              className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800"
                            >
                              {subject}
                            </span>
                          ))}
                          {teacher.subjects.length > 3 && (
                            <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                              +{teacher.subjects.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {teacher.qualification}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <Phone className="mr-1 h-4 w-4" />
                            {teacher.contact_phone}
                          </div>
                          <div className="flex items-center">
                            <Mail className="mr-1 h-4 w-4" />
                            {teacher.contact_email}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        ${teacher.salary.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link to={`/teachers/${teacher.id}`} className="text-indigo-600 hover:text-indigo-900">
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link to={`/teachers/${teacher.id}/edit`} className="text-blue-600 hover:text-blue-900">
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(teacher.id)}
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
                      No teachers found matching your search criteria.
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
              Showing <span className="font-medium">{filteredTeachers.length}</span> teachers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherList;