import AdminHeader from './AdminHeader';
import Footer from './Footer';

export default function AdminLayout({ children }) {
  return (
    <div>
      <AdminHeader />
      <main className="container section">
        {children}
      </main>
      <Footer />
    </div>
  );
}
