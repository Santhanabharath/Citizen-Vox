import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import CitizenLayout from './components/layout/CitizenLayout';
import AuthorityLayout from './components/layout/AuthorityLayout';
import WorkerLayout from './components/layout/WorkerLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportIssue from './pages/citizen/ReportIssue';
import MyIssues from './pages/citizen/MyIssues';
import IssueDetails from './pages/citizen/IssueDetails';
import CivicMap from './pages/citizen/CivicMap';
import CitizenProfile from './pages/citizen/CitizenProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Municipalities from './pages/admin/Municipalities';
import Users from './pages/admin/Users';
import Departments from './pages/admin/Departments';
import AllIssues from './pages/admin/AllIssues';
import AdminIntelligence from './pages/admin/AdminIntelligence';
import AdminIntegrity from './pages/admin/AdminIntegrity';
import AuditLogs from './pages/admin/AuditLogs';
import SystemSettings from './pages/admin/SystemSettings';

// Authority (Municipal Admin) Pages
import MunicipalDashboard from './pages/authority/MunicipalDashboard';
import PriorityQueue from './pages/authority/PriorityQueue';
import MunicipalMap from './pages/authority/MunicipalMap';
import MunicipalDepartments from './pages/authority/MunicipalDepartments';
import Escalations from './pages/authority/Escalations';
import ResolutionPerformance from './pages/authority/ResolutionPerformance';
import CivicMemory from './pages/authority/CivicMemory';
import MunicipalIntegrity from './pages/authority/MunicipalIntegrity';
import CivicCopilot from './pages/authority/CivicCopilot';

// Department Pages
import DepartmentDashboard from './pages/department/DepartmentDashboard';
import DepartmentQueue from './pages/department/DepartmentQueue';
import DepartmentIssueDetails from './pages/department/DepartmentIssueDetails';
import Workers from './pages/department/Workers';
import DepartmentMemory from './pages/department/DepartmentMemory';
import DepartmentPerformance from './pages/department/DepartmentPerformance';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerTasks from './pages/worker/WorkerTasks';
import WorkerTaskDetails from './pages/worker/WorkerTaskDetails';
import WorkerHistory from './pages/worker/WorkerHistory';
import WorkerProfile from './pages/worker/WorkerProfile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Citizen Routes */}
        <Route element={<ProtectedRoute allowedRoles={['citizen', 'super_admin', 'municipal_admin', 'department_officer', 'field_worker']} />}>
          <Route path="/citizen" element={<CitizenLayout />}>
            <Route index element={<CitizenDashboard />} />
            <Route path="report" element={<ReportIssue />} />
            <Route path="issues" element={<MyIssues />} />
            <Route path="issues/:id" element={<IssueDetails />} />
            <Route path="map" element={<CivicMap />} />
            <Route path="profile" element={<CitizenProfile />} />
          </Route>
        </Route>

        {/* Super Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
          <Route path="/admin" element={<AuthorityLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="municipalities" element={<Municipalities />} />
            <Route path="users" element={<Users />} />
            <Route path="departments" element={<Departments />} />
            <Route path="issues" element={<AllIssues />} />
            <Route path="intelligence" element={<AdminIntelligence />} />
            <Route path="integrity" element={<AdminIntegrity />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>
        </Route>

        {/* Municipal Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['municipal_admin']} />}>
          <Route path="/authority" element={<AuthorityLayout />}>
            <Route index element={<MunicipalDashboard />} />
            <Route path="queue" element={<PriorityQueue />} />
            <Route path="map" element={<MunicipalMap />} />
            <Route path="departments" element={<MunicipalDepartments />} />
            <Route path="escalations" element={<Escalations />} />
            <Route path="performance" element={<ResolutionPerformance />} />
            <Route path="memory" element={<CivicMemory />} />
            <Route path="integrity" element={<MunicipalIntegrity />} />
            <Route path="copilot" element={<CivicCopilot />} />
          </Route>
        </Route>

        {/* Department Officer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['department_officer']} />}>
          <Route path="/department" element={<AuthorityLayout />}>
            <Route index element={<DepartmentDashboard />} />
            <Route path="queue" element={<DepartmentQueue />} />
            <Route path="issues/:id" element={<DepartmentIssueDetails />} />
            <Route path="workers" element={<Workers />} />
            <Route path="memory" element={<DepartmentMemory />} />
            <Route path="performance" element={<DepartmentPerformance />} />
          </Route>
        </Route>

        {/* Worker Routes */}
        <Route element={<ProtectedRoute allowedRoles={['field_worker']} />}>
          <Route path="/worker" element={<WorkerLayout />}>
            <Route index element={<Navigate to="/worker/dashboard" replace />} />
            <Route path="dashboard" element={<WorkerDashboard />} />
            <Route path="tasks" element={<WorkerTasks />} />
            <Route path="tasks/:id" element={<WorkerTaskDetails />} />
            <Route path="history" element={<WorkerHistory />} />
            <Route path="profile" element={<WorkerProfile />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
