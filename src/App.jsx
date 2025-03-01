import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { DomainProvider } from './context/DomainContext'
import { AuthProvider } from './context/AuthContext'

// Import route components
import Home from './routes/Home'
import About from './routes/About'
import Contact from './routes/Contact'
import Login from './routes/Login'
import Register from './routes/Register'
import Dashboard from './routes/Dashboard'
import Admin from './routes/Admin'
import Dispensaries from './routes/Dispensaries'
import NotFound from './routes/NotFound'

function App() {
  return (
    <Router>
      <DomainProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/dispensaries" element={<Dispensaries />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </DomainProvider>
    </Router>
  )
}

export default App 