import './App.css'
import { Routes, Route } from 'react-router'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashPage from './pages/DashPage'
import ProtectedRoute from './ProtectedRoute'

function App() {

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashPage />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
