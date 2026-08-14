'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;
  allowLateSubmissions: boolean;
  subject: { name: string };
}

interface Submission {
  id: number;
  content: string;
  fileUrl: string;
  status: string;
  marks: number | null;
  feedback: string | null;
  updatedAt: string;
}

export default function StudentAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ content: '', fileUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [assRes, subRes] = await Promise.all([
          api.get(`/assignments/${params.id}`),
          api.get('/submissions/mine')
        ]);
        setAssignment(assRes.data);
        
        const existingSub = subRes.data.find((s: any) => s.assignmentId === parseInt(params.id as string));
        if (existingSub) {
          setSubmission(existingSub);
          setFormData({ content: existingSub.content || '', fileUrl: existingSub.fileUrl || '' });
        }
      } catch (error: any) {
        if (error.response?.status === 403) {
          alert('You do not have access to this assignment (it may be a draft or belong to another class).');
          router.push('/student/assignments');
        }
        console.error('Failed to fetch details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [params.id, router]);

  if (loading) return <div className="text-ink-muted">Loading assignment...</div>;
  if (!assignment) return <div className="text-red-400">Assignment not found.</div>;

  const isPastDeadline = new Date() > new Date(assignment.deadline);
  const canSubmit = (!submission || isEditing) && (!isPastDeadline || assignment.allowLateSubmissions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (submission && isEditing) {
        await api.put(`/submissions/${submission.id}`, formData);
      } else {
        await api.post('/submissions', { ...formData, assignmentId: assignment.id });
      }
      
      // Refresh
      const subRes = await api.get('/submissions/mine');
      const updatedSub = subRes.data.find((s: any) => s.assignmentId === assignment.id);
      setSubmission(updatedSub);
      setIsEditing(false);
      alert('Successfully submitted!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link href="/student/assignments" className="inline-flex items-center gap-2 text-ink-muted hover:text-ink transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Assignments
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 lg:p-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-ink mb-4">{assignment.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted mb-8 pb-6 border-b border-border">
              <span className="flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Due: {new Date(assignment.deadline).toLocaleString()}</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Marks: {assignment.maxMarks}</span>
              {assignment.allowLateSubmissions && (
                <span className="text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded text-xs font-medium">Late submissions allowed</span>
              )}
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-ink leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
            </div>
          </div>
        </div>

        {/* Submission Panel */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-xl p-6 sticky top-6">
            <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-green-500" />
              Your Work
            </h2>

            {submission && !isEditing ? (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <p className="text-green-400 font-medium flex items-center gap-2 mb-2">
                    {submission.status}
                  </p>
                  <p className="text-sm text-ink-muted mb-4">Last updated: {new Date(submission.updatedAt).toLocaleString()}</p>
                  
                  {submission.status === 'Graded' && (
                    <div className="mt-4 pt-4 border-t border-green-500/20">
                      <p className="text-ink font-bold text-xl mb-1">{submission.marks} / {assignment.maxMarks}</p>
                      {submission.feedback && (
                        <p className="text-sm text-ink mt-2 bg-paper p-3 rounded-lg border border-border">
                          <span className="block text-ink-muted text-xs uppercase mb-1">Teacher Feedback:</span>
                          {submission.feedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {submission.status !== 'Graded' && (!isPastDeadline || assignment.allowLateSubmissions) && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2.5 rounded-lg border border-border text-ink hover:bg-border/30 transition-colors text-sm font-medium"
                  >
                    Unsubmit / Edit Work
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {isPastDeadline && !assignment.allowLateSubmissions ? (
                  <div className="rubber-stamp-red p-4 rounded-lg text-sm">
                    The deadline has passed. You can no longer submit this assignment.
                  </div>
                ) : (
                  <>
                    {isPastDeadline && assignment.allowLateSubmissions && (
                      <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-lg text-xs font-medium flex items-center gap-2">
                        This will be marked as Late.
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-ink-muted mb-1">Answer Text</label>
                      <textarea 
                        rows={6} 
                        required 
                        placeholder="Write your answer here..."
                        value={formData.content} 
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                        className="w-full bg-paper border border-border rounded-lg px-4 py-3 text-ink focus:outline-none focus:border-green-500 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-muted mb-1 flex items-center justify-between">
                        File Link (Optional)
                        <FileText className="w-4 h-4" />
                      </label>
                      <input 
                        type="url" 
                        placeholder="https://docs.google.com/..."
                        value={formData.fileUrl} 
                        onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} 
                        className="w-full bg-paper border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-green-500 text-sm" 
                      />
                    </div>
                    
                    <div className="pt-2 flex gap-2">
                      {isEditing && (
                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2.5 rounded-lg border border-border text-ink hover:bg-border/30 transition-colors text-sm font-medium">
                          Cancel
                        </button>
                      )}
                      <button 
                        type="submit" 
                        disabled={submitting}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-ink py-2.5 rounded-lg transition-colors text-sm font-medium shadow-lg shadow-green-900/20"
                      >
                        {submitting ? 'Turning in...' : 'Turn In'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
