import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { DomainProvider } from './context/DomainContext'
import { AuthProvider } from './context/AuthContext'
import ScrollToTop from './components/ScrollToTop'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DynamicFavicon } from './components/DynamicFavicon'

// Import route components
import Home from './routes/Home'
import Contact from './routes/Contact'
import Login from './routes/Login'
import Register from './routes/Register'
import Dashboard from './routes/Dashboard'
import Admin from './routes/Admin'
import Dispensaries from './routes/Dispensaries'
import NotFound from './routes/NotFound'
import PrivacyPolicy from './routes/PrivacyPolicy'
import TermsOfService from './routes/TermsOfService'
import StrainGuide from './routes/StrainGuide'
import FAQ from './routes/FAQ'
import MedicalCards from './routes/MedicalCards'
import Subscription from './routes/Subscription'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <DomainProvider>
        <DynamicFavicon />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<Admin />} />
            <Route path="/dispensaries" element={<Dispensaries />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/strain-guide" element={<StrainGuide />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/medical-cards" element={<MedicalCards />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </DomainProvider>
    </Router>
  )
}

export default App 