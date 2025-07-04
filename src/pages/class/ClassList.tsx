import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Search, BookPlus, Users } from 'lucide-react';
import { supabase, Class } from '../../lib/supabase';

const ClassList = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          teacher:teachers(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClasses(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setClasses(classes.filter(cls => cls.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter classes based on search query
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cls.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (cls.teacher?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        <button
          onClick={() => navigate('/classes/new')}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <BookPlus className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
          Add New Class
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

      {/* Search */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="relative max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Class list */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="min-w-full divide-y divide-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Class
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Class Teacher
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Subjects
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Max Students
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((cls: Class) => (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                              <Users className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{cls.name} - {cls.section}</div>
                            <div className="text-sm text-gray-500">ID: {cls.id.substring(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {cls.teacher?.full_name || 'Not assigned'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {cls.subjects.slice(0, 3).map((subject) => (
                            <span
                              key={subject}
                              className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800"
                            >
                              {subject}
                            </span>
                          ))}
                          {cls.subjects.length > 3 && (
                            <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                              +{cls.subjects.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {cls.max_students}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link to={`/classes/${cls.id}`} className="text-indigo-600 hover:text-indigo-900">
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link to={`/classes/${cls.id}/edit`} className="text-blue-600 hover:text-blue-900">
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(cls.id)}
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
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                      No classes found matching your search criteria.
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
              Showing <span className="font-medium">{filteredClasses.length}</span> classes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassList;