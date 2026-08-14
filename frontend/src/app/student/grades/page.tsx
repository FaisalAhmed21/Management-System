'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { CheckCircle, MessageSquare } from 'lucide-react';

interface Assignment {
  title: string;
  maxMarks: number;
}

interface Submission {
  id: number;
  assignmentId: number;
  status: string;
  marks: number | null;
  feedback: string | null;
  updatedAt: string;
  assignment: Assignment;
}

export default function StudentGradesPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.get('/submissions/mine');
        // Filter only graded submissions
        const graded = res.data.filter((s: Submission) => s.status === 'Graded');
        setSubmissions(graded);
      } catch (error) {
        console.error('Failed to fetch grades', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  if (loading) return <div className="text-ink-muted">Loading your grades...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">My Grades</h1>
      
      {submissions.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-ink-muted">You haven't received any grades yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {submissions.map(submission => (
            <div key={submission.id} className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border">
                <div>
                  <h3 className="text-lg font-bold text-ink">
                    <Link href={`/student/assignments/${submission.assignmentId}`} className="hover:text-green-400 transition-colors">
                      {submission.assignment.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-ink-muted mt-1">Graded on: {new Date(submission.updatedAt).toLocaleDateString()}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-green-400">{submission.marks}</span>
                    <span className="text-xs text-ink-muted">out of {submission.assignment.maxMarks}</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </div>
              
              {submission.feedback && (
                <div className="p-6 bg-surface/50">
                  <h4 className="text-sm font-medium text-ink-muted flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4" /> Teacher Feedback
                  </h4>
                  <p className="text-ink text-sm whitespace-pre-wrap">{submission.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
