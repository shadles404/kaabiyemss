import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Search, BookOpen, Calendar, Users, FileText } from 'lucide-react';
import { supabase, Exam } from '../../lib/supabase';

const ExamList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          class:classes(name, section)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam? This will also delete all associated marks.')) return;

    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setExams(exams.filter(exam => exam.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter exams based on search query
  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (exam.class?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
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
        <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/exams/marks')}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FileText className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
            Enter Marks
          </button>
          <button
            onClick={() => navigate('/exams/new')}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <BookOpen className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
            Create Exam
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

      {/* Search */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="relative max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Search exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Exam list */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="min-w-full divide-y divide-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Exam Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Class
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Subject
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Marks
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredExams.length > 0 ? (
                  filteredExams.map((exam: Exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                              <BookOpen className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                            <div className="text-sm text-gray-500">ID: {exam.id.substring(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {exam.class ? `${exam.class.name} - ${exam.class.section}` : 'Not assigned'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                          {exam.subject}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(exam.exam_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="text-sm font-medium">Max: {exam.max_marks}</div>
                          <div className="text-sm text-gray-500">Pass: {exam.passing_marks}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link 
                            to={`/exams/${exam.id}/marks`} 
                            className="text-green-600 hover:text-green-900"
                            title="Enter Marks"
                          >
                            <FileText className="h-5 w-5" />
                          </Link>
                          <Link to={`/exams/${exam.id}`} className="text-indigo-600 hover:text-indigo-900">
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link to={`/exams/${exam.id}/edit`} className="text-blue-600 hover:text-blue-900">
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(exam.id)}
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
                      No exams found matching your search criteria.
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
              Showing <span className="font-medium">{filteredExams.length}</span> exams
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamList;