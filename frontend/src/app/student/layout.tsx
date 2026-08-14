'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { LogOut, BookOpen, CheckCircle, GraduationCap } from 'lucide-react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'Student' && user.role !== 'Admin') {
      router.push('/teacher');
    }
  }, [user, router]);

  if (!isMounted || !user || (user.role !== 'Student' && user.role !== 'Admin')) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { name: 'My Assignments', href: '/student/assignments', icon: BookOpen },
    { name: 'My Grades', href: '/student/grades', icon: CheckCircle },
  ];

  return (
    <div className="flex h-screen bg-gray-950">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="text-green-500" />
            Student Portal
          </h2>
          <p className="text-sm text-gray-400 mt-1">Welcome, {user.name}</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-green-600/10 text-green-500 font-medium' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-950 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
