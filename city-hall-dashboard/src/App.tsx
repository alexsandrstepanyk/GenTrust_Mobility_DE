import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Departments from './pages/Departments'; // ✅ NEW
import CreateDepartmentScreen from './screens/CreateDepartmentScreen'; // ✅ NEW
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
          <Route path="departments" element={<Departments />} />
          <Route path="departments/create" element={<CreateDepartmentScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
