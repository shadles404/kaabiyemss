import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, X, Upload, Trash2 } from 'lucide-react';
import { supabase, Teacher } from '../../lib/supabase';

const TeacherEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    full_name: '',
    gender: 'male' as 'male' | 'female' | 'other',
    subjects: [] as string[],
    qualification: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    joining_date: '',
    salary: '',
    photo_url: '',
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
      fetchTeacher();
    }
  }, [id]);

  const fetchTeacher = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name,
          gender: data.gender,
          subjects: data.subjects || [],
          qualification: data.qualification,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email,
          address: data.address,
          joining_date: data.joining_date,
          salary: data.salary.toString(),
          photo_url: data.photo_url || '',
        });
        setCurrentPhotoUrl(data.photo_url || '');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, JPG, or PNG)');
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      setError('File size must be less than 2MB');
      return;
    }

    setError('');
    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeCurrentPhoto = () => {
    setCurrentPhotoUrl('');
    setFormData({
      ...formData,
      photo_url: '',
    });
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `teachers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let photoUrl = currentPhotoUrl;

      // Upload new photo if selected
      if (selectedFile) {
        setUploading(true);
        photoUrl = await uploadPhoto(selectedFile);
        setUploading(false);
      }

      const { data, error: updateError } = await supabase
        .from('teachers')
        .update({
          full_name: formData.full_name,
          gender: formData.gender,
          subjects: formData.subjects,
          qualification: formData.qualification,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
          address: formData.address,
          joining_date: formData.joining_date,
          salary: parseFloat(formData.salary),
          photo_url: photoUrl || null,
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
        navigate('/teachers');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update teacher');
      setUploading(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Teacher</h1>
        <button
          onClick={() => navigate('/teachers')}
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
                Teacher updated successfully!
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
            <h3 className="text-lg font-medium leading-6 text-gray-900">Teacher Information</h3>
            <p className="mt-1 text-sm text-gray-500">Update the teacher's information below.</p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="full_name"
                    id="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender *
                </label>
                <div className="mt-1">
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
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

              <div className="sm:col-span-3">
                <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">
                  Qualification *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="qualification"
                    id="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="joining_date" className="block text-sm font-medium text-gray-700">
                  Joining Date *
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="joining_date"
                    id="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
                  Contact Phone *
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="contact_phone"
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                  Contact Email *
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="contact_email"
                    id="contact_email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                  Monthly Salary *
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="salary"
                    id="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <div className="mt-1">
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Photo
                </label>
                <div className="mt-1">
                  <div className="flex items-center space-x-4">
                    {/* Current/Preview photo */}
                    <div className="flex-shrink-0">
                      {previewUrl ? (
                        <img
                          className="h-20 w-20 rounded-full object-cover"
                          src={previewUrl}
                          alt="Preview"
                        />
                      ) : currentPhotoUrl ? (
                        <img
                          className="h-20 w-20 rounded-full object-cover"
                          src={currentPhotoUrl}
                          alt="Current photo"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                          <Upload className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    {/* File input and controls */}
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Upload a new photo (JPEG, PNG, max 2MB)
                      </p>
                      
                      <div className="mt-2 flex items-center space-x-4">
                        {selectedFile && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{selectedFile.name}</span>
                            <button
                              type="button"
                              onClick={clearSelectedFile}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        
                        {currentPhotoUrl && !selectedFile && (
                          <button
                            type="button"
                            onClick={removeCurrentPhoto}
                            className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <button
              type="submit"
              disabled={isSubmitting || uploading || formData.subjects.length === 0}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting || uploading ? (
                <>
                  <svg className="mr-3 -ml-1 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {uploading ? 'Uploading Photo...' : 'Updating...'}
                </>
              ) : (
                'Update Teacher'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherEdit;