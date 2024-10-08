import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './component/layout';
import Product from './component/Products/Product';
import Citem from './component/Citem';
import Campaign from './component/Campaign';
import Dashboard from './component/Dashboard';
import Admin from './component/Admin';
import Login from './component/login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Define Layout for the main structure */}
        <Route path="/" element={<Login />} />
        <Route path="/app" element={<Layout />}>
          {/* Nested routes under /app */}
          <Route index element={<Dashboard />} /> {/* Default dashboard route */}
          <Route path="product" element={<Product />} /> {/* No leading / */}
          <Route path="citem" element={<Citem />} /> {/* No leading / */}
          <Route path="campaign" element={<Campaign />} /> {/* No leading / */}
          <Route path="admin" element={<Admin />} /> {/* No leading / */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
