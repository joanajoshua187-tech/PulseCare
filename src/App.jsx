import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import PatientDashboard from './pages/PatientDashboard'
import SymptomAssessment from './pages/SymptomAssessment'
import BookAppointment from './pages/BookAppointment'
import MyAppointments from './pages/MyAppointments'
import Consultation from './pages/Consultation'
import HealthRecords from './pages/HealthRecords'
import ProviderDashboard from './pages/ProviderDashboard'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PatientDashboard />} />
        <Route path="/symptoms" element={<SymptomAssessment />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/appointments" element={<MyAppointments />} />
        <Route path="/consultation/:appointmentId" element={<Consultation />} />
        <Route path="/records" element={<HealthRecords />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App