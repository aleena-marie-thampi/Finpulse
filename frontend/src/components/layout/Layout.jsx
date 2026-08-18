import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  return (
    <div
      className="flex h-screen w-full overflow-hidden font-sans antialiased"
      style={{ background: '#17252A', color: '#FEFFFF' }}
    >
      <Sidebar />

      <main className="flex-1 min-w-0 overflow-y-auto relative">
        <Outlet />
      </main>

      <Toaster
        position="top-right"
        containerClassName="z-[9999]"
        toastOptions={{
          style: {
            background: '#0F1E23',
            color: '#FEFFFF',
            border: '1px solid rgba(43,122,120,0.35)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#3AAFA9', secondary: '#0F1E23' },
          },
          error: {
            iconTheme: { primary: '#F87171', secondary: '#0F1E23' },
          },
        }}
      />
    </div>
  );
}