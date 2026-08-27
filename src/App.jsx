import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import CitizenLayout from './components/layout/CitizenLayout';
import AuthorityLayout from './components/layout/AuthorityLayout';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Dashboard Placeholders
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportIssue from './pages/citizen/ReportIssue';
import MyIssues from './pages/citizen/MyIssues';
import IssueDetails from './pages/citizen/IssueDetails';
import CivicMap from './pages/citizen/CivicMap';
import CitizenProfile from './pages/citizen/CitizenProfile';
import AuthorityDashboard from './pages/authority/AuthorityDashboard';

import AdminDashboard from './pages/admin/AdminDashboard';
import AuthorityIssueDetails from './pages/authority/AuthorityIssueDetails';
import AuthorityMap from './pages/authority/AuthorityMap';
import AuthorityDepartments from './pages/authority/AuthorityDepartments';
import CivicIntelligence from './pages/authority/CivicIntelligence';

// Worker Pages
import WorkerLayout from './components/layout/WorkerLayout';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerTasks from './pages/worker/WorkerTasks';
import WorkerTaskDetails from './pages/worker/WorkerTaskDetails';
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
        <Route path="/citizen" element={<CitizenLayout />}>
          <Route index element={<CitizenDashboard />} />
          <Route path="report" element={<ReportIssue />} />
          <Route path="issues" element={<MyIssues />} />
          <Route path="issues/:id" element={<IssueDetails />} />
          <Route path="map" element={<CivicMap />} />
          <Route path="profile" element={<CitizenProfile />} />
        </Route>

        {/* Authority Routes */}
        <Route path="/authority" element={<AuthorityLayout />}>
          <Route index element={<AuthorityDashboard />} />
          <Route path="issues" element={<div>All Issues Placeholder</div>} />
          <Route path="issues/:id" element={<AuthorityIssueDetails />} />
          <Route path="map" element={<AuthorityMap />} />
          <Route path="departments" element={<AuthorityDepartments />} />
          <Route path="intelligence" element={<CivicIntelligence />} />
        </Route>

        {/* Worker Routes */}
        <Route path="/worker" element={<WorkerLayout />}>
          <Route index element={<Navigate to="/worker/tasks" replace />} />
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="tasks" element={<WorkerTasks />} />
          <Route path="tasks/:id" element={<WorkerTaskDetails />} />
          <Route path="map" element={<div>Worker Map Placeholder</div>} />
          <Route path="profile" element={<div>Worker Profile</div>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AuthorityLayout /> /* Temp fallback layout */}>
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
