import AdminHeader from './AdminHeader';

export default function AdminLayout({ children }) {
  return (
    <div>
      <AdminHeader />
      <main className="container section">
        {children}
      </main>
    </div>
  );
}
