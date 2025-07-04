import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Calendar, Users, DollarSign, GraduationCap, Filter, Search, Eye } from 'lucide-react';
import { supabase, Teacher, Class } from '../../lib/supabase';
import TeacherAttendanceReport from './TeacherAttendanceReport';
import StudentFeeReport from './StudentFeeReport';
import TeacherSalaryReport from './TeacherSalaryReport';
import StudentInformationReport from './StudentInformationReport';

type ReportType = 'teacher-attendance' | 'student-fee' | 'teacher-salary' | 'student-info';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('teacher-attendance');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    classId: '',
    teacherId: '',
    startDate: '',
    endDate: '',
    subject: '',
    paymentStatus: '',
  });

  const reportTypes = [
    {
      id: 'teacher-attendance' as ReportType,
      name: 'Teacher Attendance Report',
      description: 'View attendance records for teachers',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'student-fee' as ReportType,
      name: 'Student Fee Report',
      description: 'Track student fee payments and outstanding amounts',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'teacher-salary' as ReportType,
      name: 'Teacher Salary Report',
      description: 'Monitor teacher salary payments',
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'student-info' as ReportType,
      name: 'Student Information Report',
      description: 'Comprehensive student data and profiles',
      icon: GraduationCap,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const availableSubjects = [
    'Mathematics', 'English', 'Science', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Physical Education',
    'Art', 'Music', 'Literature', 'Social Studies', 'Economics'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teachersResponse, classesResponse] = await Promise.all([
        supabase.from('teachers').select('*').order('full_name'),
        supabase.from('classes').select('*, teacher:teachers(full_name)').order('name')
      ]);

      if (teachersResponse.error) throw teachersResponse.error;
      if (classesResponse.error) throw classesResponse.error;

      setTeachers(teachersResponse.data || []);
      setClasses(classesResponse.data || []);
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
  };

  const resetFilters = () => {
    setFilters({
      classId: '',
      teacherId: '',
      startDate: '',
      endDate: '',
      subject: '',
      paymentStatus: '',
    });
  };

  const renderReportComponent = () => {
    const commonProps = { filters, teachers, classes };
    
    switch (selectedReport) {
      case 'teacher-attendance':
        return <TeacherAttendanceReport {...commonProps} />;
      case 'student-fee':
        return <StudentFeeReport {...commonProps} />;
      case 'teacher-salary':
        return <TeacherSalaryReport {...commonProps} />;
      case 'student-info':
        return <StudentInformationReport {...commonProps} />;
      default:
        return null;
    }
  };

  const getRelevantFilters = () => {
    switch (selectedReport) {
      case 'teacher-attendance':
        return ['teacherId', 'startDate', 'endDate'];
      case 'student-fee':
        return ['classId', 'startDate', 'endDate', 'paymentStatus'];
      case 'teacher-salary':
        return ['teacherId', 'startDate', 'endDate', 'paymentStatus'];
      case 'student-info':
        return ['classId', 'teacherId'];
      default:
        return [];
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
    <div className="pb-16 md:pb-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Printouts</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate comprehensive reports for attendance, fees, salaries, and student information
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

      {/* Report Type Selection */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`relative rounded-lg border-2 p-4 text-left transition-all hover:shadow-md ${
              selectedReport === report.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${report.color}`}>
                <report.icon className="h-6 w-6" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-gray-900">{report.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{report.description}</p>
              </div>
            </div>
            {selectedReport === report.id && (
              <div className="absolute top-2 right-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Filters Section */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Report Filters</h3>
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Class Filter */}
          {getRelevantFilters().includes('classId') && (
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
          )}

          {/* Teacher Filter */}
          {getRelevantFilters().includes('teacherId') && (
            <div>
              <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700">
                Teacher
              </label>
              <select
                id="teacherId"
                value={filters.teacherId}
                onChange={(e) => handleFilterChange('teacherId', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Teachers</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Start Date Filter */}
          {getRelevantFilters().includes('startDate') && (
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          )}

          {/* End Date Filter */}
          {getRelevantFilters().includes('endDate') && (
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          )}

          {/* Subject Filter */}
          {getRelevantFilters().includes('subject') && (
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <select
                id="subject"
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Subjects</option>
                {availableSubjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Status Filter */}
          {getRelevantFilters().includes('paymentStatus') && (
            <div>
              <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">
                Payment Status
              </label>
              <select
                id="paymentStatus"
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Report Content */}
      <div className="rounded-lg bg-white shadow">
        {renderReportComponent()}
      </div>
    </div>
  );
};

export default Reports;