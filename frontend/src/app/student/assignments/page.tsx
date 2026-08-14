'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;
}

interface Submission {
  id: number;
  assignmentId: number;
  status: string;
  marks: number | null;
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assRes, subRes] = await Promise.all([
          api.get('/assignments/for-me'), // Backend natively filters out drafts!
          api.get('/submissions/mine')
        ]);
        setAssignments(assRes.data);
        setSubmissions(subRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSubmissionStatus = (assignmentId: number) => {
    const sub = submissions.find(s => s.assignmentId === assignmentId);
    if (!sub) return { type: 'pending', text: 'Not Submitted', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    if (sub.status === 'Graded') return { type: 'graded', text: `Graded: ${sub.marks} marks`, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' };
    if (sub.status === 'Late') return { type: 'late', text: 'Submitted Late', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { type: 'submitted', text: 'Submitted', icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' };
  };

  if (loading) return <div className="text-gray-400">Loading your assignments...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Assignments</h1>
      
      {assignments.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400">You don't have any published assignments right now. Enjoy your free time!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map(assignment => {
            const status = getSubmissionStatus(assignment.id);
            const Icon = status.icon;
            
            return (
              <Link href={`/student/assignments/${assignment.id}`} key={assignment.id}>
                <div className="bg-gray-900 border border-gray-800 hover:border-green-500/50 rounded-xl p-6 transition-all group cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                      {assignment.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>Due: {new Date(assignment.deadline).toLocaleString()}</span>
                      <span>•</span>
                      <span>Max Marks: {assignment.maxMarks}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${status.bg} ${status.color} text-sm font-medium`}>
                      <Icon className="w-4 h-4" />
                      {status.text}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-green-500 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
