'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { LogOut, BookOpen, FileText, CheckCircle, LayoutDashboard } from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'Teacher') {
      router.push(user.role === 'Admin' ? '/admin' : '/student');
    }
  }, [user, router]);

  if (!isMounted || !user || user.role !== 'Teacher') {
    return null; // or a loading spinner
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { name: 'Overview', href: '/teacher', icon: LayoutDashboard },
    { name: 'My Assignments', href: '/teacher/assignments', icon: BookOpen },
    { name: 'Submissions', href: '/teacher/submissions', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-paper">
      {/* Sidebar */}
      <aside className="w-64 bg-teacher text-white border-r-0 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Teacher Portal
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/teacher');
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-500 font-medium' 
                    : 'text-white-muted hover:text-white hover:bg-border/30'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-white-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-paper p-8 text-ink">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
