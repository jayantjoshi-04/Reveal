import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth, type Role } from './store/auth.js';
import { Landing } from './features/landing/Landing.js';
import { Welcome } from './features/welcome/Welcome.js';
import { SignUp } from './features/auth/SignUp.js';
import { SignIn } from './features/auth/SignIn.js';
import { AdminSignIn } from './features/auth/AdminSignIn.js';
import { Onboarding } from './features/onboarding/Onboarding.js';
import { CaptureFlow } from './features/capture/CaptureFlow.js';
import { StudentDashboard } from './features/dashboard/StudentDashboard.js';
import { ReportPage } from './features/report/ReportPage.js';
import { AdminLayout } from './features/admin/AdminLayout.js';
import { AdminOverview } from './features/admin/AdminOverview.js';
import { QuestionManager } from './features/admin/QuestionManager.js';
import { ReportManager } from './features/admin/ReportManager.js';
import { StudentDirectory } from './features/admin/StudentDirectory.js';
import { AdminSettings } from './features/admin/AdminSettings.js';
import { V2Home } from './features/v2/V2Home.js';
import { V2Capture } from './features/v2/V2Capture.js';
import { V2Report } from './features/v2/V2Report.js';

function Protected({ allow, children }: { allow: Role[]; children: JSX.Element }): JSX.Element {
  const role = useAuth((s) => s.role);
  if (!role || !allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/admin/signin" element={<AdminSignIn />} />

      {/* REVEAL 2.0.0 — the deterministic-engine experience (parallel to v1) */}
      <Route path="/v2" element={<V2Home />} />
      <Route path="/v2/capture" element={<V2Capture />} />
      <Route path="/v2/report/:id" element={<V2Report />} />

      <Route path="/onboarding" element={<Protected allow={['student']}><Onboarding /></Protected>} />
      <Route path="/survey" element={<Protected allow={['student']}><CaptureFlow /></Protected>} />
      <Route path="/dashboard" element={<Protected allow={['student']}><StudentDashboard /></Protected>} />
      <Route path="/report/:id" element={<Protected allow={['student', 'admin']}><ReportPage /></Protected>} />

      <Route path="/admin" element={<Protected allow={['admin']}><AdminLayout /></Protected>}>
        <Route index element={<AdminOverview />} />
        <Route path="questions" element={<QuestionManager />} />
        <Route path="reports" element={<ReportManager />} />
        <Route path="students" element={<StudentDirectory />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
