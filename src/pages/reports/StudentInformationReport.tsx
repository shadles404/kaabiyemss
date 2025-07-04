import React, { useState, useEffect } from 'react';
import { Download, Printer, Users, GraduationCap } from 'lucide-react';
import { supabase, Student, Class } from '../../lib/supabase';

interface Props {
  filters: {
    classId: string;
    teacherId: string;
  };
  classes: Class[];
  teachers: any[];
}

const StudentInformationReport: React.FC<Props> = ({ filters, classes, teachers }) => {
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentData();
  }, [filters]);

  const fetchStudentData = async () => {
    setLoading(true);
    setError('');
    
    try {
      let query = supabase
        .from('students')
        .select(`
          *,
          class:classes(
            name,
            section,
            teacher:teachers(full_name)
          )
        `)
        .order('created_at', { ascending: false });

      // Filter by class
      if (filters.classId) {
        query = query.eq('class_id', filters.classId);
      }

      // Filter by teacher (students in classes taught by the teacher)
      if (filters.teacherId) {
        const { data: teacherClasses } = await supabase
          .from('classes')
          .select('id')
          .eq('teacher_id', filters.teacherId);
        
        if (teacherClasses && teacherClasses.length > 0) {
          const classIds = teacherClasses.map(cls => cls.id);
          query = query.in('class_id', classIds);
        } else {
          // No classes for selected teacher
          setStudentData([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setStudentData(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    window.print();
  };

  const downloadCSV = () => {
    const headers = [
      'Full Name', 'Date of Birth', 'Gender', 'Guardian Name', 'Class', 
      'Admission Date', 'Address', 'Contact Phone', 'Contact Email'
    ];
    const csvData = studentData.map(student => [
      student.full_name,
      student.date_of_birth,
      student.gender,
      student.guardian_name,
      student.class ? `${student.class.name} - ${student.class.section}` : '',
      student.admission_date,
      student.address,
      student.contact_phone,
      student.contact_email
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-information-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateStats = () => {
    const totalStudents = studentData.length;
    const maleStudents = studentData.filter(s => s.gender === 'male').length;
    const femaleStudents = studentData.filter(s => s.gender === 'female').length;
    const otherStudents = studentData.filter(s => s.gender === 'other').length;
    
    const classDistribution = studentData.reduce((acc, student) => {
      const className = student.class ? `${student.class.name} - ${student.class.section}` : 'Unassigned';
      acc[className] = (acc[className] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ageDistribution = studentData.reduce((acc, student) => {
      const birthDate = new Date(student.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const ageGroup = age < 6 ? 'Under 6' : age < 12 ? '6-11' : age < 18 ? '12-17' : '18+';
      acc[ageGroup] = (acc[ageGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalStudents,
      male: maleStudents,
      female: femaleStudents,
      other: otherStudents,
      classDistribution,
      ageDistribution,
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Student Information Report</h2>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive student data and profiles from live database records
          </p>
        </div>
        
        {studentData.length > 0 && (
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

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      ) : studentData.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Student Records</h3>
          <p className="mt-1 text-sm text-gray-500">
            No student records found for the selected criteria.
          </p>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Total Students</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Male Students</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.male}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-pink-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Female Students</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.female}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GraduationCap className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Classes</dt>
                    <dd className="text-lg font-medium text-gray-900">{Object.keys(stats.classDistribution).length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Class Distribution */}
          {Object.keys(stats.classDistribution).length > 1 && (
            <div className="mb-6 rounded-lg bg-white border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Class Distribution</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Object.entries(stats.classDistribution).map(([className, count]) => (
                  <div key={className} className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-500">{className}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Age Distribution */}
          {Object.keys(stats.ageDistribution).length > 0 && (
            <div className="mb-6 rounded-lg bg-white border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Age Distribution</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Object.entries(stats.ageDistribution).map(([ageGroup, count]) => (
                  <div key={ageGroup} className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-500">{ageGroup} years</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Table */}
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date of Birth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Guardian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Admission Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {studentData.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
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
                      {new Date(student.date_of_birth).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800 capitalize">
                        {student.gender}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {student.guardian_name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {student.class ? `${student.class.name} - ${student.class.section}` : 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        <div>{student.contact_phone}</div>
                        <div className="text-xs">{student.contact_email}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(student.admission_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed Statistics */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Contact Information Summary */}
            <div className="rounded-lg bg-white border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Students with Email:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {studentData.filter(s => s.contact_email).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Students with Phone:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {studentData.filter(s => s.contact_phone).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Students with Photos:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {studentData.filter(s => s.photo_url).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Admission Timeline */}
            <div className="rounded-lg bg-white border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Admissions</h3>
              <div className="space-y-2">
                {studentData
                  .sort((a, b) => new Date(b.admission_date).getTime() - new Date(a.admission_date).getTime())
                  .slice(0, 5)
                  .map((student) => (
                    <div key={student.id} className="flex justify-between">
                      <span className="text-sm text-gray-900 truncate">{student.full_name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(student.admission_date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentInformationReport;