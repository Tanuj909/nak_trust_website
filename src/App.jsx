import { Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home/Home'
import About from './pages/About/About'
import Schemes from './pages/Schemes/Schemes'
import Niyamawali from './pages/Niyamawali/Niyamawali'
import Members from './pages/Members/Members'
import Registration from './pages/Registration/Registration'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Cooperation from './pages/Cooperation/Cooperation'
import Donate from './pages/Donate/Donate'
import Applications from './pages/Applications/Applications'
import News from './pages/News/News'
import Team from './pages/Team/Team'
import Gallery from './pages/Gallery/Gallery'
import Contact from './pages/Contact/Contact'
import Legal from './pages/Legal/Legal'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/niyamawali" element={<Niyamawali />} />
        <Route path="/members" element={<Members />} />
        <Route path="/member-registration" element={<Registration />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/member-login" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/member-dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/sahyog-suchi" element={<Cooperation />} />
        <Route path="/death-sahyog-suchi" element={<Cooperation />} />
        <Route path="/kanyadaan-suchi" element={<Cooperation />} />
        <Route path="/sahyog-kare" element={<Cooperation />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/welfare-applications" element={<Applications />} />
        <Route path="/apply" element={<Applications />} />
        <Route path="/news" element={<News />} />
        <Route path="/blog" element={<News />} />
        <Route path="/our-team" element={<Team />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<Legal />} />
        <Route path="/terms-and-conditions" element={<Legal />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}