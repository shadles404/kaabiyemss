import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Save, Users, BookOpen } from 'lucide-react';
import { supabase, Exam, Student, StudentMark } from '../../lib/supabase';

const MarksEntry = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId?: string }>();
  const [selectedExamId, setSelectedExamId] = useState(examId || '');
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [existingMarks, setExistingMarks] = useState<StudentMark[]>([]);
  const [marksData, setMarksData] = useState<Record<string, { marks: string; remarks: string }>>({});
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchExamDetails();
      fetchStudentsAndMarks();
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          class:classes(name, section)
        `)
        .order('exam_date', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchExamDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          class:classes(name, section)
        `)
        .eq('id', selectedExamId)
        .single();

      if (error) throw error;
      setSelectedExam(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchStudentsAndMarks = async () => {
    setLoading(true);
    try {
      // Get exam details first to find the class
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('class_id')
        .eq('id', selectedExamId)
        .single();

      if (examError) throw examError;

      // Fetch students in the exam's class
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', examData.class_id)
        .order('full_name');

      if (studentsError) throw studentsError;

      // Fetch existing marks for this exam
      const { data: marksData, error: marksError } = await supabase
        .from('student_marks')
        .select('*')
        .eq('exam_id', selectedExamId);

      if (marksError) throw marksError;

      setStudents(studentsData || []);
      setExistingMarks(marksData || []);

      // Initialize marks data with existing marks
      const initialMarksData: Record<string, { marks: string; remarks: string }> = {};
      studentsData?.forEach(student => {
        const existingMark = marksData?.find(mark => mark.student_id === student.id);
        initialMarksData[student.id] = {
          marks: existingMark ? existingMark.marks_obtained.toString() : '',
          remarks: existingMark?.remarks || ''
        };
      });
      setMarksData(initialMarksData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId: string, field: 'marks' | 'remarks', value: string) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate marks
      for (const [studentId, data] of Object.entries(marksData)) {
        if (data.marks && selectedExam) {
          const marks = parseInt(data.marks);
          if (marks < 0 || marks > selectedExam.max_marks) {
            throw new Error(`Marks for student must be between 0 and ${selectedExam.max_marks}`);
          }
        }
      }

      // Prepare data for upsert
      const marksToUpsert = Object.entries(marksData)
        .filter(([_, data]) => data.marks !== '')
        .map(([studentId, data]) => ({
          student_id: studentId,
          exam_id: selectedExamId,
          marks_obtained: parseInt(data.marks),
          remarks: data.remarks || null
        }));

      if (marksToUpsert.length === 0) {
        throw new Error('Please enter marks for at least one student');
      }

      // Use upsert to handle both insert and update
      const { error: upsertError } = await supabase
        .from('student_marks')
        .upsert(marksToUpsert, {
          onConflict: 'student_id,exam_id'
        });

      if (upsertError) throw upsertError;

      setShowSuccess(true);
      
      // Refresh the data
      fetchStudentsAndMarks();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPassStatus = (marks: string) => {
    if (!marks || !selectedExam) return null;
    const marksNum = parseInt(marks);
    return marksNum >= selectedExam.passing_marks ? 'Pass' : 'Fail';
  };

  const getPassStatusClass = (marks: string) => {
    const status = getPassStatus(marks);
    if (status === 'Pass') return 'text-green-600';
    if (status === 'Fail') return 'text-red-600';
    return '';
  };

  return (
    <div className="pb-16 md:pb-0">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Enter Student Marks</h1>
        <button
          onClick={() => navigate('/exams')}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Back to Exams
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

      {/* Success message */}
      {showSuccess && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Marks saved successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Exam Selection */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="exam" className="block text-sm font-medium text-gray-700">
              Select Exam *
            </label>
            <select
              id="exam"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Choose an exam</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} - {exam.class?.name} {exam.class?.section} ({exam.subject})
                </option>
              ))}
            </select>
          </div>

          {selectedExam && (
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">{selectedExam.title}</h3>
                  <p className="text-sm text-blue-600">
                    Max Marks: {selectedExam.max_marks} | Pass Marks: {selectedExam.passing_marks}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Marks Entry Form */}
      {selectedExamId && selectedExam && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Student Marks</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter marks for {selectedExam.title} - {selectedExam.subject}
                </p>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="mr-1 h-4 w-4" />
                {students.length} students
              </div>
            </div>
          </div>

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
                        Marks Obtained
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Remarks
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
                              <div className="text-sm text-gray-500">ID: {student.id.substring(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            max={selectedExam.max_marks}
                            value={marksData[student.id]?.marks || ''}
                            onChange={(e) => handleMarksChange(student.id, 'marks', e.target.value)}
                            className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="0"
                          />
                          <div className="mt-1 text-xs text-gray-500">
                            Max: {selectedExam.max_marks}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`text-sm font-medium ${getPassStatusClass(marksData[student.id]?.marks || '')}`}>
                            {getPassStatus(marksData[student.id]?.marks || '') || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={marksData[student.id]?.remarks || ''}
                            onChange={(e) => handleMarksChange(student.id, 'remarks', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Optional remarks"
                          />
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
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
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
                    <>
                      <Save className="mr-2 -ml-1 h-5 w-5" />
                      Save Marks
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="px-4 py-10 text-center sm:px-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Users className="h-8 w-8 text-gray-400" aria-hidden="true" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No students are enrolled in the selected exam's class.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!selectedExamId && (
        <div className="rounded-lg bg-white p-10 text-center shadow">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <BookOpen className="h-8 w-8 text-blue-400" aria-hidden="true" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Select an Exam</h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose an exam from the dropdown above to start entering marks.
          </p>
        </div>
      )}
    </div>
  );
};

export default MarksEntry;