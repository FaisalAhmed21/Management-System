'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  totalClasses: number;
  totalSubjects: number;
  totalAssignments: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, classes, subjects, assignments] = await Promise.all([
          api.get('/users'),
          api.get('/classes'),
          api.get('/subjects'),
          api.get('/assignments')
        ]);
        
        setStats({
          totalUsers: users.data.length,
          totalClasses: classes.data.length,
          totalSubjects: subjects.data.length,
          totalAssignments: assignments.data.length
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading overview...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">System Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats?.totalUsers },
          { label: 'Classes & Courses', value: stats?.totalClasses },
          { label: 'Subjects', value: stats?.totalSubjects },
          { label: 'Assignments', value: stats?.totalAssignments },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-gray-400 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
