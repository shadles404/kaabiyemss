import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import MainLayout from './components/Layout/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard
import Dashboard from './pages/Dashboard';

// Student Pages
import StudentList from './pages/student/StudentList';
import StudentRegistration from './pages/student/StudentRegistration';
import StudentEdit from './pages/student/StudentEdit';
import StudentAttendance from './pages/student/StudentAttendance';

// Teacher Pages
import TeacherList from './pages/teacher/TeacherList';
import TeacherRegistration from './pages/teacher/TeacherRegistration';
import TeacherEdit from './pages/teacher/TeacherEdit';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherSalary from './pages/teacher/TeacherSalary';

// Class Pages
import ClassList from './pages/class/ClassList';
import ClassRegistration from './pages/class/ClassRegistration';
import ClassEdit from './pages/class/ClassEdit';

// Exam Pages
import ExamList from './pages/exam/ExamList';
import ExamCreate from './pages/exam/ExamCreate';
import MarksEntry from './pages/exam/MarksEntry';
import MarksReport from './pages/exam/MarksReport';

// Finance Pages
import StudentFees from './pages/financials/StudentFees';

// Reports Pages
import Reports from './pages/reports/Reports';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            
            {/* Student Routes */}
            <Route path="students" element={<StudentList />} />
            <Route path="students/new" element={<StudentRegistration />} />
            <Route path="students/:id/edit" element={<StudentEdit />} />
            <Route path="student-attendance" element={<StudentAttendance />} />
            
            {/* Teacher Routes */}
            <Route path="teachers" element={<TeacherList />} />
            <Route path="teachers/new" element={<TeacherRegistration />} />
            <Route path="teachers/:id/edit" element={<TeacherEdit />} />
            <Route path="teacher-attendance" element={<TeacherAttendance />} />
            <Route path="teacher-salary" element={<TeacherSalary />} />
            
            {/* Class Routes */}
            <Route path="classes" element={<ClassList />} />
            <Route path="classes/new" element={<ClassRegistration />} />
            <Route path="classes/:id/edit" element={<ClassEdit />} />
            
            {/* Exam Routes */}
            <Route path="exams" element={<ExamList />} />
            <Route path="exams/new" element={<ExamCreate />} />
            <Route path="exams/marks" element={<MarksEntry />} />
            <Route path="exams/:examId/marks" element={<MarksEntry />} />
            <Route path="exams/reports" element={<MarksReport />} />
            
            {/* Finance Routes */}
            <Route path="student-fees" element={<StudentFees />} />
            
            {/* Reports Routes */}
            <Route path="reports" element={<Reports />} />
            
            {/* Catch-all redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;