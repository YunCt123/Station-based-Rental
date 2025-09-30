
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import './App.css';
import Stations from './pages/Stations';
import HowItWorks from './pages/HowItWorks';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => { }} />} />
        <Route path="/stations" element={<Stations />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        {/* Add more routes here as needed */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App
