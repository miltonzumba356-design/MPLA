import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Mentions from './pages/Mentions'
import Analysis from './pages/Analysis'
import Comparison from './pages/Comparison'
import Reports from './pages/Reports'
import FakeNews from './pages/FakeNews'
import NewProject from './pages/NewProject'
import { getToken } from './api'

function PrivateRoute({ children }) {
  const token = getToken()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mentions/:projectId?" element={<Mentions />} />
          <Route path="analysis/:projectId?" element={<Analysis />} />
          <Route path="comparison/:projectId?" element={<Comparison />} />
          <Route path="reports/:projectId?" element={<Reports />} />
          <Route path="fake-news/:projectId?" element={<FakeNews />} />
          <Route path="new-project" element={<NewProject />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
