import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';
import { supabase, Class } from '../../lib/supabase';

const ExamCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    class_id: '',
    subject: '',
    exam_date: '',
    max_marks: '',
    passing_marks: '',
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
    fetchClasses();
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validation
    if (parseInt(formData.passing_marks) > parseInt(formData.max_marks)) {
      setError('Passing marks cannot be greater than maximum marks');
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('exams')
        .insert([{
          title: formData.title,
          class_id: formData.class_id,
          subject: formData.subject,
          exam_date: formData.exam_date,
          max_marks: parseInt(formData.max_marks),
          passing_marks: parseInt(formData.passing_marks),
        }])
        .select();

      if (insertError) {
        throw insertError;
      }

      setShowSuccess(true);
      
      // Clear form after 2 seconds and redirect
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/exams');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create Exam</h1>
        <button
          onClick={() => navigate('/exams')}
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
                Exam created successfully!
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
            <h3 className="text-lg font-medium leading-6 text-gray-900">Exam Information</h3>
            <p className="mt-1 text-sm text-gray-500">Please fill in all the required information for the exam.</p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Exam Title *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Mid-term Examination, Final Exam"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="class_id" className="block text-sm font-medium text-gray-700">
                  Class *
                </label>
                <div className="mt-1">
                  <select
                    id="class_id"
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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

              <div className="sm:col-span-3">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject *
                </label>
                <div className="mt-1">
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Select a subject</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="exam_date" className="block text-sm font-medium text-gray-700">
                  Exam Date *
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="exam_date"
                    id="exam_date"
                    value={formData.exam_date}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="max_marks" className="block text-sm font-medium text-gray-700">
                  Maximum Marks *
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="max_marks"
                    id="max_marks"
                    value={formData.max_marks}
                    onChange={handleChange}
                    required
                    min="1"
                    max="1000"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="passing_marks" className="block text-sm font-medium text-gray-700">
                  Passing Marks *
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="passing_marks"
                    id="passing_marks"
                    value={formData.passing_marks}
                    onChange={handleChange}
                    required
                    min="1"
                    max={formData.max_marks || "1000"}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="40"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Minimum marks required to pass this exam
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="mr-3 -ml-1 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating
                </>
              ) : (
                'Create Exam'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamCreate;