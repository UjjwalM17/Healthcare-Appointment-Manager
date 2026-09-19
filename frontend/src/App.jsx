import { useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminDashboard from './pages/AdminDashboard'

// SVG Icons
const Icons = {
  Home: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Bell: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Menu: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [page, setPage] = useState('login')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleLogin = (token) => {
    setToken(token)
    setActiveTab('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setPage('login')
  }

  let user = null
  let role = null
  if (token) {
    try {
      user = jwtDecode(token)
      role = user.role
    } catch (e) {
      localStorage.removeItem('token')
    }
  }

  const navItemClass = (tabName) => `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors w-full text-left ${
    activeTab === tabName 
      ? 'bg-green-50 text-green-700' 
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
  }`

  // Unauthenticated View
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">H</div>
                <span className="font-bold text-xl text-gray-900 tracking-tight">HealthCare</span>
              </div>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setPage('login')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${page === 'login' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Login
                </button>
                <button 
                  onClick={() => setPage('register')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${page === 'register' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="flex-grow flex items-center justify-center p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiLz48L3N2Zz4=')]">
          {page === 'login' ? <Login onLogin={handleLogin} /> : <Register />}
        </main>
      </div>
    )
  }

  // Authenticated View (Sidebar Layout)
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3 shadow-sm">H</div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">HealthCare</span>
        </div>

        {/* User Profile Summary */}
        <div className="p-6 border-b border-gray-100 bg-green-50/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-lg border border-green-200">
              {user?.sub?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.sub}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1 uppercase">
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <button 
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} 
            className={navItemClass('dashboard')}
          >
            <Icons.Home /> Dashboard
          </button>
          
          {role !== 'ADMIN' && (
            <button 
              onClick={() => { setActiveTab('appointments'); setSidebarOpen(false); }} 
              className={navItemClass('appointments')}
            >
              <Icons.Calendar /> Appointments
            </button>
          )}

          {role === 'ADMIN' && (
            <button 
              onClick={() => { setActiveTab('configurations'); setSidebarOpen(false); }} 
              className={navItemClass('configurations')}
            >
              <Icons.Settings /> Configurations
            </button>
          )}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg font-medium transition-colors"
          >
            <Icons.Logout /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 flex-shrink-0">
          <div className="flex items-center">
            <button 
              className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Icons.Menu />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {role === 'PATIENT' ? 'Patient Portal' : role === 'DOCTOR' ? 'Physician Portal' : 'Admin Console'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-500 relative p-1 rounded-full hover:bg-gray-100 transition-colors">
              <span className="absolute top-1 right-1.5 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              <Icons.Bell />
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {role === 'PATIENT' && <PatientDashboard userId={user?.id} activeTab={activeTab} />}
            {role === 'DOCTOR' && <DoctorDashboard userId={user?.id} activeTab={activeTab} />}
            {role === 'ADMIN' && <AdminDashboard activeTab={activeTab} />}
            {!role && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span className="font-medium">Unknown role. Please login again.</span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

    </div>
  )
}