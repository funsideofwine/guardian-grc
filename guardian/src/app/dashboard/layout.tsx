import Sidebar from '../../components/Sidebar';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-950 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
} 