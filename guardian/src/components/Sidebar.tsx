"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HomeIcon, FileTextIcon, CheckCircledIcon, BadgeIcon, GearIcon, ActivityLogIcon } from '@radix-ui/react-icons';
import ThemeToggle from './ThemeToggle';
import { SignOutButton, useUser } from '@clerk/nextjs';
import UserProfileSidebar from './UserProfileSidebar';
import { Button } from '@/components/ui/Button';

function getUserRole(userId: string | undefined) {
  if (typeof window !== 'undefined' && userId) {
    const adminId = localStorage.getItem('adminUserId');
    if (adminId && userId === adminId) return 'Admin';
  }
  return 'Viewer';
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: <HomeIcon /> },
  { name: 'Policies', href: '/dashboard/policies', icon: <FileTextIcon /> },
  { name: 'Risks', href: '/dashboard/risks', icon: <CheckCircledIcon /> },
  { name: 'Compliance', href: '/dashboard/compliance', icon: <BadgeIcon /> },
];

export default function Sidebar() {
  const { user } = useUser();
  const [role, setRole] = useState('Viewer');
  useEffect(() => {
    if (user) setRole(getUserRole(user.id));
  }, [user]);

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col p-4 space-y-2 min-h-screen">
      <UserProfileSidebar />
      <div className="text-2xl font-bold text-primary mb-8">Guardian</div>
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-sidebar-accent transition-colors text-sidebar-foreground hover:text-sidebar-foreground"
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
        {role === 'Admin' && (
          <Link
            href="/dashboard/activity"
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-sidebar-accent transition-colors text-sidebar-foreground hover:text-sidebar-foreground"
          >
            <span className="text-xl"><ActivityLogIcon /></span>
            <span>Activity Log</span>
          </Link>
        )}
      </nav>
      {role === 'Admin' && (
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-sidebar-accent transition-colors mb-2 text-sidebar-foreground hover:text-sidebar-foreground"
        >
          <span className="text-xl"><GearIcon /></span>
          <span>Settings</span>
        </Link>
      )}
      <div className="mt-auto pt-4 flex flex-col gap-2">
        <ThemeToggle />
        <SignOutButton>
          <Button variant="danger" className="w-full mt-2">
            Sign Out
          </Button>
        </SignOutButton>
      </div>
    </aside>
  );
} 