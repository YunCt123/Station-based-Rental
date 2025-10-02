
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Stations from './pages/Stations';
import HowItWorks from './pages/HowItWorks';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/stations" element={<Stations />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Routes>
    </Router>
  );
}

export default App
