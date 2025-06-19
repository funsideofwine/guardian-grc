"use client";
import { UserButton, useUser } from '@clerk/nextjs';

function getUserRole(user: unknown) {
  if (!user || typeof user !== 'object' || user === null) return 'Viewer';
  const userObj = user as { id: string };
  // Check localStorage for adminUserId
  if (typeof window !== 'undefined') {
    let adminId = localStorage.getItem('adminUserId');
    if (!adminId) {
      // First user to sign in becomes admin
      localStorage.setItem('adminUserId', userObj.id);
      adminId = userObj.id;
    }
    if (userObj.id === adminId) return 'Admin';
  }
  return 'Viewer';
}

export default function UserProfileSidebar() {
  const { user } = useUser();
  if (!user) return null;
  const role = getUserRole(user);
  return (
    <div className="flex flex-col items-center mb-8">
      <UserButton afterSignOutUrl="/" />
      <div className="mt-2 text-sm text-center">
        <div className="font-semibold text-sidebar-foreground">{user.fullName || user.username || user.primaryEmailAddress?.emailAddress}</div>
        <div className="text-xs text-muted">{user.primaryEmailAddress?.emailAddress}</div>
        <div className="mt-1 text-xs text-primary font-bold">Role: {role}</div>
      </div>
    </div>
  );
} 