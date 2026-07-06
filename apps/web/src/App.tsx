import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './store/auth.js';
import { Landing } from './features/landing/Landing.js';
import { CaptureFlow } from './features/capture/CaptureFlow.js';
import { Queue } from './features/facilitator/Queue.js';
import { ReviewGate } from './features/facilitator/ReviewGate.js';
import { ReportPage } from './features/report/ReportPage.js';
import { AdminDashboard } from './features/admin/AdminDashboard.js';
import type { Role } from './store/auth.js';

function Protected({ allow, children }: { allow: Role[]; children: JSX.Element }): JSX.Element {
  const role = useAuth((s) => s.role);
  if (!role || !allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/capture"
        element={
          <Protected allow={['student']}>
            <CaptureFlow />
          </Protected>
        }
      />
      <Route
        path="/facilitator"
        element={
          <Protected allow={['facilitator', 'admin']}>
            <Queue />
          </Protected>
        }
      />
      <Route
        path="/facilitator/:id"
        element={
          <Protected allow={['facilitator', 'admin']}>
            <ReviewGate />
          </Protected>
        }
      />
      <Route
        path="/admin"
        element={
          <Protected allow={['admin']}>
            <AdminDashboard />
          </Protected>
        }
      />
      <Route path="/report/:id" element={<ReportPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
