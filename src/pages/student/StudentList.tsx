import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Search, UserPlus, Filter, Zap, Users as UsersIcon } from 'lucide-react';
import { supabase, Student, Class } from '../../lib/supabase';

const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [error, setError] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(name, section)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setStudents(students.filter(student => student.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter students based on search query and class filter
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.contact_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass ? student.class_id === filterClass : true;
    return matchesSearch && matchesClass;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-400 border-b-transparent rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black relative pb-16 md:pb-0">
      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-400/20">
              <UsersIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Student Database
              </h1>
              <p className="text-gray-400 flex items-center gap-2 mt-1">
                <Zap className="w-4 h-4 text-cyan-400" />
                Manage your student records
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/students/new')}
            className="group relative inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30"
          >
            <UserPlus className="w-5 h-5" />
            Add New Student
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/20 border border-red-500/30 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <div>
                <h3 className="text-sm font-medium text-red-300">System Alert</h3>
                <p className="text-sm text-red-200 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and filters */}
        <div className="mb-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-lg border-0 bg-gray-900/50 py-3 pl-12 pr-4 text-gray-100 placeholder:text-gray-400 focus:bg-gray-900 focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                className="rounded-lg border-0 bg-gray-900/50 py-3 px-4 text-gray-100 focus:bg-gray-900 focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.section}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Student Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student: Student, index) => (
              <div
                key={student.id}
                className="group relative rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-400/20"
                onMouseEnter={() => setHoveredCard(student.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Holographic Background */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Student Avatar */}
                <div className="relative mb-4 flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 p-1">
                      <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                        {student.photo_url ? (
                          <img className="w-full h-full rounded-full object-cover" src={student.photo_url} alt="" />
                        ) : (
                          <span className="text-xl font-bold text-cyan-400">
                            {student.full_name.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    {hoveredCard === student.id && (
                      <div className="absolute -inset-2 rounded-full border-2 border-cyan-400/50 animate-pulse"></div>
                    )}
                  </div>
                </div>

                {/* Student Info */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors duration-200">
                    {student.full_name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {student.class ? `${student.class.name} - ${student.class.section}` : 'Not assigned'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {student.id.substring(0, 8)}
                  </p>
                </div>

                {/* Student Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Guardian:</span>
                    <span className="text-gray-300">{student.guardian_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Admission:</span>
                    <span className="text-gray-300">{new Date(student.admission_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-2">
                  <Link 
                    to={`/students/${student.id}`} 
                    className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-200 hover:scale-110"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link 
                    to={`/students/${student.id}/edit`} 
                    className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-200 hover:scale-110"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(student.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200 hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Particle Effect on Hover */}
                {hoveredCard === student.id && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
                        style={{
                          left: `${20 + i * 20}%`,
                          top: `${30 + (i % 2) * 40}%`,
                          animationDelay: `${i * 200}ms`
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                <UsersIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Students Found</h3>
              <p className="text-gray-500 text-center max-w-md">
                {searchQuery || filterClass 
                  ? "No students match your search criteria. Try adjusting your filters."
                  : "Get started by adding your first student to the system."
                }
              </p>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-8 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300">
                Showing <span className="font-semibold text-cyan-400">{filteredStudents.length}</span> students
              </span>
            </div>
            <div className="text-sm text-gray-400">
              Total: {students.length} students in database
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentList;