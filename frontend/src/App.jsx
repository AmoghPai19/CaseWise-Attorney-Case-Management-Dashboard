import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import CasesPage from "./pages/CasesPage";
import CaseDetailsPage from "./pages/CaseDetailsPage";
import ClientsPage from "./pages/ClientsPage";
import TasksPage from "./pages/TasksPage";
import DocumentsPage from "./pages/DocumentsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import CreateCasePage from "./pages/CreateCasePage";
import { useAuth } from "./state/AuthContext";


function App() {
  const { user } = useAuth();

  return (
    <Routes>

      {/* Smart Root Redirect */}
      <Route
        path="/"
        element={
          user ? (
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<DashboardPage />} />

        <Route path="cases" element={<CasesPage />} />
        <Route path="cases/new" element={<CreateCasePage />} />
        <Route path="cases/:id" element={<CaseDetailsPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Public - Block if already logged in */}
      <Route
        path="/login"
        element={
          user ? <Navigate to="/" replace /> : <LoginPage />
        }
      />

      <Route
        path="/register"
        element={
          user ? <Navigate to="/" replace /> : <RegisterPage />
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}
export default App;