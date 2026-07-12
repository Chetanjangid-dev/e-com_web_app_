import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Auth from './pages/Auth/Auth';
import NotFound from './pages/NotFound/NotFound';
import AdminPanel from './pages/Admin/AdminPanel';

export default function App() {
  return (
    <>
      <Routes>
        {/* Admin Panel — full-screen, no Navbar */}
        <Route path="/admin-control" element={<AdminPanel />} />

        {/* Public store */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <main>
                <Routes>
                  <Route path="/"             element={<Home />} />
                  <Route path="/product/:id"  element={<ProductDetail />} />
                  <Route path="/cart"         element={<Cart />} />
                  <Route path="/auth"         element={<Auth />} />
                  <Route path="*"             element={<NotFound />} />
                </Routes>
              </main>
            </>
          }
        />
      </Routes>
    </>
  );
}
