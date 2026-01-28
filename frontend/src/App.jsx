import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import AdminHeader from './components/AdminHeader';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminSuppliers from './pages/AdminSuppliers';

function UserLayout({ children }) {
  return (
    <div>
      <Header />
      <main className="container section">{children}</main>
      <Footer />
    </div>
  );
}

function AdminLayoutWrapper({ children }) {
  return (
    <div>
      <AdminHeader />
      <main className="container section">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Admin Routes */}
      {user?.role === 'admin' && (
        <>
          <Route path="/" element={<AdminLayoutWrapper><AdminProducts /></AdminLayoutWrapper>} />
          <Route path="/admin/products" element={<AdminLayoutWrapper><AdminProducts /></AdminLayoutWrapper>} />
          <Route path="/admin/suppliers" element={<AdminLayoutWrapper><AdminSuppliers /></AdminLayoutWrapper>} />
          <Route path="/admin/orders" element={<AdminLayoutWrapper><AdminOrders /></AdminLayoutWrapper>} />
          <Route path="/products" element={<AdminLayoutWrapper><AdminProducts /></AdminLayoutWrapper>} />
          <Route path="/orders" element={<AdminLayoutWrapper><AdminOrders /></AdminLayoutWrapper>} />
        </>
      )}

      {/* User Routes - only show if NOT admin */}
      {user?.role !== 'admin' && (
        <>
          <Route path="/" element={<UserLayout><Home /></UserLayout>} />
          <Route path="/products" element={<UserLayout><ProductList /></UserLayout>} />
          <Route path="/cart" element={<UserLayout><Cart /></UserLayout>} />
          <Route element={<UserLayout><PrivateRoute /></UserLayout>}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
          </Route>
        </>
      )}

      {/* Auth Routes (always available) */}
      <Route path="/login" element={<UserLayout><Login /></UserLayout>} />
      <Route path="/register" element={<UserLayout><Register /></UserLayout>} />
    </Routes>
  );
}
