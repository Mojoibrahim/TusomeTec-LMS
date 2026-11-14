import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Auth/Login';
import Register from './Auth/Register';
import OtpVerification from './Auth/OtpVerification';
import OAuthCallback from './Auth/OAuthCallback';
import './App.css';

// Role-Specific Dashboards
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUserProfile from './pages/Admin/AdminUserProfile';
import InstructorDashboard from './pages/Instructor/InstructorDashboard';
import StudentDashboard from './pages/Student/StudentDashboard';

// Security Component
import ProtectedRoute from './components/ProtectedRoute';
import { getDashboardPath } from './utils/dashboardRoutes';

function DashboardRedirect() {
  const user = JSON.parse(localStorage.getItem('user_data'));
  const dashboardPath = getDashboardPath(user);

  return <Navigate to={dashboardPath || '/unauthorized'} replace />;
}

function Unauthorized() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ color: '#ef4444', fontSize: '36px' }}>403 - Access Denied</h1>
      <p style={{ color: '#64748b' }}>Your assigned role does not have permission to view this page.</p>
      <button 
        onClick={() => window.history.back()} 
        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px' }}
      >
        Go Back
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Admin Portal */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users/:userId" element={<AdminUserProfile />} />
        </Route>

        {/* Instructor Portal */}
        <Route element={<ProtectedRoute allowedRoles={['instructor', 'admin']} />}>
          <Route path="/instructor/dashboard/:grade?" element={<InstructorDashboard />} />
        </Route>

        {/* Student Portal (Formerly TestDashboard) */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/test-dashboard" element={<StudentDashboard />} />
        </Route>

        {/* Route legacy dashboard links to the signed-in user's role-specific dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<div style={{ textAlign: 'center', marginTop: '100px' }}><h1>404 - Page Not Found</h1></div>} />
      </Routes>
    </Router>
  );
}

export default App;