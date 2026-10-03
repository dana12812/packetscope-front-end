import { useContext, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';

// Components
import NavBar from './components/NavBar/NavBar';
import Sidebar from './components/Sidebar/Sidebar';
import TopHeader from './components/TopHeader/TopHeader';
import SignUpForm from './components/SignUpForm/SignUpForm';
import SignInForm from './components/SignInForm/SignInForm';
import Dashboard from './components/Dashboard/Dashboard';
import Landing from './components/Landing/Landing';
import CaptureDetail from './components/CaptureDetail/CaptureDetail';
import EditCaptureForm from './components/EditCaptureForm/EditCaptureForm';
import TagManager from './components/TagManager/TagManager';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminUserDetail from './components/Admin/AdminUserDetail';
import NotFound from './components/NotFound/NotFound';

// Context
import { UserContext } from './contexts/UserContext';

const App = () => {
  const { user } = useContext(UserContext)
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  // Sign in / sign up carry their own brand panel instead of the top nav
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';
  // UI gate only — the back end checks the role on every admin request
  const isAdmin = user?.role === 'admin';

  const routes = (
    <Routes>
      <Route path='/' element={user ? <Dashboard /> : <Landing />} />
      <Route path='/sign-up' element={<SignUpForm />} />
      <Route path='/sign-in' element={<SignInForm />} />
      <Route path='/captures/:captureId' element={user ? <CaptureDetail /> : <Landing />} />
      <Route path='/captures/:captureId/edit' element={user ? <EditCaptureForm /> : <Landing />} />
      <Route path='/tags' element={user ? <TagManager /> : <Landing />} />
      <Route path='/admin' element={isAdmin ? <AdminDashboard /> : <Navigate to='/' replace />} />
      <Route path='/admin/users/:userId' element={isAdmin ? <AdminUserDetail /> : <Navigate to='/' replace />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  );

  if (!user) {
    return (
      <>
        {!isAuthPage && <NavBar />}
        {routes}
      </>
    );
  }

  return (
    <div className={`app-shell ${menuOpen ? 'menu-open' : ''}`}>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="app-main">
        <TopHeader onOpenMenu={() => setMenuOpen(true)} />
        {routes}
      </div>
    </div>
  );
};

export default App;
