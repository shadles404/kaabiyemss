import React, { useState, useEffect } from 'react';
import { Download, Printer, BookOpen, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase, Exam, StudentMark, Class } from '../../lib/supabase';

const MarksReport = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [marksData, setMarksData] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    classId: '',
    examId: '',
  });

  useEffect(() => {
    fetchClasses();
    fetchExams();
  }, []);

  useEffect(() => {
    if (filters.examId) {
      fetchMarksData();
    }
  }, [filters.examId]);

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

  const fetchExams = async () => {
    try {
      let query = supabase
        .from('exams')
        .select(`
          *,
          class:classes(name, section)
        `)
        .order('exam_date', { ascending: false });

      if (filters.classId) {
        query = query.eq('class_id', filters.classId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExams(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchMarksData = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('student_marks')
        .select(`
          *,
          student:students(
            full_name,
            contact_phone,
            contact_email,
            class:classes(name, section)
          ),
          exam:exams(
            title,
            subject,
            max_marks,
            passing_marks,
            exam_date
          )
        `)
        .eq('exam_id', filters.examId)
        .order('marks_obtained', { ascending: false });

      if (error) throw error;
      setMarksData(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));

    if (key === 'classId') {
      // Reset exam selection when class changes
      setFilters(prev => ({
        ...prev,
        examId: ''
      }));
      setMarksData([]);
    }
  };

  const generatePDF = () => {
    window.print();
  };

  const downloadCSV = () => {
    if (marksData.length === 0) return;

    const headers = ['Student Name', 'Class', 'Marks Obtained', 'Max Marks', 'Percentage', 'Status', 'Remarks'];
    const csvData = marksData.map(mark => [
      mark.student?.full_name || '',
      mark.student?.class ? `${mark.student.class.name} - ${mark.student.class.section}` : '',
      mark.marks_obtained,
      mark.exam?.max_marks || '',
      mark.exam?.max_marks ? ((mark.marks_obtained / mark.exam.max_marks) * 100).toFixed(1) + '%' : '',
      mark.exam?.passing_marks ? (mark.marks_obtained >= mark.exam.passing_marks ? 'Pass' : 'Fail') : '',
      mark.remarks || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marks-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadgeClass = (marks: number, passingMarks: number) => {
    return marks >= passingMarks
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const calculateStats = () => {
    if (marksData.length === 0) return null;

    const exam = marksData[0]?.exam;
    if (!exam) return null;

    const totalStudents = marksData.length;
    const passedStudents = marksData.filter(mark => mark.marks_obtained >= exam.passing_marks).length;
    const failedStudents = totalStudents - passedStudents;
    const passPercentage = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : '0';
    
    const totalMarks = marksData.reduce((sum, mark) => sum + mark.marks_obtained, 0);
    const averageMarks = totalStudents > 0 ? (totalMarks / totalStudents).toFixed(1) : '0';
    const averagePercentage = totalStudents > 0 ? ((totalMarks / (totalStudents * exam.max_marks)) * 100).toFixed(1) : '0';

    const highestMarks = Math.max(...marksData.map(mark => mark.marks_obtained));
    const lowestMarks = Math.min(...marksData.map(mark => mark.marks_obtained));

    return {
      totalStudents,
      passedStudents,
      failedStudents,
      passPercentage,
      averageMarks,
      averagePercentage,
      highestMarks,
      lowestMarks,
      exam
    };
  };

  const stats = calculateStats();

  // Filter exams based on selected class
  const filteredExams = filters.classId 
    ? exams.filter(exam => exam.class_id === filters.classId)
    : exams;

  return (
    <div className="pb-16 md:pb-0">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marks Report</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and analyze student performance in exams
          </p>
        </div>
        
        {marksData.length > 0 && (
          <div className="flex space-x-3">
            <button
              onClick={downloadCSV}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </button>
            <button
              onClick={generatePDF}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Report Filters</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
              Class
            </label>
            <select
              id="classId"
              value={filters.classId}
              onChange={(e) => handleFilterChange('classId', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="examId" className="block text-sm font-medium text-gray-700">
              Exam
            </label>
            <select
              id="examId"
              value={filters.examId}
              onChange={(e) => handleFilterChange('examId', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select an exam</option>
              {filteredExams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} - {exam.subject} ({new Date(exam.exam_date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      ) : !filters.examId ? (
        <div className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Select an Exam</h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose a class and exam to view the marks report.
          </p>
        </div>
      ) : marksData.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Marks Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No marks have been entered for the selected exam yet.
          </p>
        </div>
      ) : (
        <>
          {/* Statistics */}
          {stats && (
            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Total Students</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalStudents}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Pass Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.passPercentage}%</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Average Marks</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.averageMarks}/{stats.exam.max_marks}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingDown className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Average %</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.averagePercentage}%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Exam Details */}
          {stats && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-blue-900">{stats.exam.title}</h3>
                  <p className="text-sm text-blue-700">
                    Subject: {stats.exam.subject} | Date: {new Date(stats.exam.exam_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-blue-700">
                    Max Marks: {stats.exam.max_marks} | Passing Marks: {stats.exam.passing_marks}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-700">Highest: {stats.highestMarks}</div>
                  <div className="text-sm text-blue-700">Lowest: {stats.lowestMarks}</div>
                </div>
              </div>
            </div>
          )}

          {/* Marks Table */}
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Marks Obtained
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {marksData.map((mark, index) => (
                  <tr key={mark.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{mark.student?.full_name}</div>
                        <div className="text-sm text-gray-500">{mark.student?.contact_phone}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {mark.student?.class ? `${mark.student.class.name} - ${mark.student.class.section}` : 'Not assigned'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="font-medium">{mark.marks_obtained}</span>
                        <span className="ml-1 text-gray-500">/ {mark.exam?.max_marks}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {mark.exam?.max_marks ? ((mark.marks_obtained / mark.exam.max_marks) * 100).toFixed(1) : '0'}%
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        mark.exam?.passing_marks ? getStatusBadgeClass(mark.marks_obtained, mark.exam.passing_marks) : 'bg-gray-100 text-gray-800'
                      }`}>
                        {mark.exam?.passing_marks ? (mark.marks_obtained >= mark.exam.passing_marks ? 'Pass' : 'Fail') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {mark.remarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Statistics */}
          {stats && (
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg bg-white border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Pass/Fail Distribution</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Passed:</span>
                    <span className="text-sm font-medium text-green-600">{stats.passedStudents} students</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Failed:</span>
                    <span className="text-sm font-medium text-red-600">{stats.failedStudents} students</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm text-gray-500">Pass Rate:</span>
                    <span className="text-sm font-medium text-gray-900">{stats.passPercentage}%</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Score Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Highest Score:</span>
                    <span className="text-sm font-medium text-gray-900">{stats.highestMarks}/{stats.exam.max_marks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Lowest Score:</span>
                    <span className="text-sm font-medium text-gray-900">{stats.lowestMarks}/{stats.exam.max_marks}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm text-gray-500">Class Average:</span>
                    <span className="text-sm font-medium text-gray-900">{stats.averageMarks}/{stats.exam.max_marks} ({stats.averagePercentage}%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MarksReport;