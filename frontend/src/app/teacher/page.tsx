'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BookOpen, Users, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function TeacherOverviewPage() {
  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalSubmissions: 0,
    pendingGrades: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // We fetch the assignments created by this teacher
        const assignmentsRes = await api.get('/assignments');
        
        // This is a naive count based on whatever the backend returns.
        // Assuming the backend filters by logged-in teacher automatically 
        // as per the spec "Teachers can only see classes/subjects assigned to them".
        
        const assignments = assignmentsRes.data;
        
        setStats({
          totalAssignments: assignments.length,
          totalSubmissions: 0, // Would need an aggregate endpoint or to fetch all submissions for these assignments
          pendingGrades: 0
        });
      } catch (error) {
        console.error('Failed to load teacher stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="text-ink-muted">Loading overview...</div>;

  const statCards = [
    { title: 'My Assignments', value: stats.totalAssignments, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Total Submissions', value: 'N/A', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Pending Grades', value: 'N/A', icon: CheckCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-8">Teacher Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-surface border border-border rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted font-medium mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-ink">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-ink mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/teacher/assignments" className="block p-4 rounded-xl border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-ink hover:text-ink">
              Create a new Assignment
            </Link>
            <Link href="/teacher/submissions" className="block p-4 rounded-xl border border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-ink hover:text-ink">
              Grade pending Submissions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
