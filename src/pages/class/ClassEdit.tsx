import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';
import { supabase, Teacher, Class } from '../../lib/supabase';

const ClassEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    section: '',
    teacher_id: '',
    subjects: [] as string[],
    max_students: '30',
  });

  const availableSubjects = [
    'Mathematics',
    'English',
    'Science',
    'History',
    'Geography',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Physical Education',
    'Art',
    'Music',
    'Literature',
    'Social Studies',
    'Economics',
  ];

  useEffect(() => {
    if (id) {
      fetchClass();
      fetchTeachers();
    }
  }, [id]);

  const fetchClass = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name,
          section: data.section,
          teacher_id: data.teacher_id || '',
          subjects: data.subjects || [],
          max_students: data.max_students.toString(),
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { data, error: updateError } = await supabase
        .from('classes')
        .update({
          name: formData.name,
          section: formData.section,
          teacher_id: formData.teacher_id || null,
          subjects: formData.subjects,
          max_students: parseInt(formData.max_students),
        })
        .eq('id', id)
        .select();

      if (updateError) {
        throw updateError;
      }

      setShowSuccess(true);
      
      // Clear form after 2 seconds and redirect
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/classes');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update class');
    } finally {
      setIsSubmitting(false);
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
    <div className="mx-auto max-w-4xl pb-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Class</h1>
        <button
          onClick={() => navigate('/classes')}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      {/* Success message */}
      {showSuccess && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Class updated successfully!
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setShowSuccess(false)}
                  className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                >
                  <span className="sr-only">Dismiss</span>
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Class Information</h3>
            <p className="mt-1 text-sm text-gray-500">Update the class information below.</p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Class Name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="section" className="block text-sm font-medium text-gray-700">
                  Section *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="section"
                    id="section"
                    value={formData.section}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700">
                  Class Teacher
                </label>
                <div className="mt-1">
                  <select
                    id="teacher_id"
                    name="teacher_id"
                    value={formData.teacher_id}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Select a teacher (optional)</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="max_students" className="block text-sm font-medium text-gray-700">
                  Maximum Students *
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="max_students"
                    id="max_students"
                    value={formData.max_students}
                    onChange={handleChange}
                    required
                    min="1"
                    max="100"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Subjects *
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {availableSubjects.map((subject) => (
                    <label key={subject} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={() => handleSubjectToggle(subject)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <button
              type="submit"
              disabled={isSubmitting || formData.subjects.length === 0}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="mr-3 -ml-1 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating
                </>
              ) : (
                'Update Class'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassEdit;