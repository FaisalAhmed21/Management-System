'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Edit3, CheckCircle, X } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
}

interface Assignment {
  id: number;
  title: string;
  maxMarks: number;
}

interface Submission {
  id: number;
  assignmentId: number;
  studentId: number;
  content: string;
  fileUrl: string;
  status: string;
  marks: number | null;
  feedback: string | null;
  submittedAt: string;
  updatedAt: string;
  assignment?: Assignment;
  student?: Student;
}

export default function TeacherSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  
  const [formData, setFormData] = useState({
    marks: '' as string | number,
    feedback: ''
  });

  const fetchSubmissions = async () => {
    try {
      const res = await api.get('/submissions/for-teacher');
      setSubmissions(res.data);
    } catch (error) {
      console.error('Failed to fetch submissions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleOpenGradeModal = (submission: Submission) => {
    setActiveSubmission(submission);
    setFormData({
      marks: submission.marks ?? '',
      feedback: submission.feedback || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveSubmission(null);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;
    
    try {
      await api.put(`/submissions/${activeSubmission.id}/grade`, {
        ...formData,
        marks: Number(formData.marks)
      });
      fetchSubmissions();
      handleCloseModal();
    } catch (error: any) {
      console.error('Failed to save grade', error);
      alert(error.response?.data?.message || 'Failed to save grade');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Graded':
        return <span className="rubber-stamp-blue">Graded</span>;
      case 'Late':
        return <span className="rubber-stamp-red">Late</span>;
      default:
        return <span className="rubber-stamp-green">{status}</span>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink">Student Submissions</h1>
      </div>

      {loading ? (
        <div className="text-ink-muted">Loading submissions...</div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-border/20 border-b border-border">
                <th className="p-4 text-sm font-medium text-ink-muted">Assignment</th>
                <th className="p-4 text-sm font-medium text-ink-muted">Student</th>
                <th className="p-4 text-sm font-medium text-ink-muted">Submitted At</th>
                <th className="p-4 text-sm font-medium text-ink-muted">Status</th>
                <th className="p-4 text-sm font-medium text-ink-muted">Marks</th>
                <th className="p-4 text-sm font-medium text-ink-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-border/30 transition-colors">
                  <td className="p-4 text-sm text-ink">
                    {sub.assignment?.title || `Assignment ID: ${sub.assignmentId}`}
                  </td>
                  <td className="p-4 text-sm text-ink-muted">
                    {sub.student?.name || `Student ID: ${sub.studentId}`}
                  </td>
                  <td className="p-4 text-sm text-ink-muted">
                    {new Date(sub.submittedAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(sub.status)}
                  </td>
                  <td className="p-4 text-sm text-ink-muted">
                    {sub.marks !== null ? `${sub.marks} / ${sub.assignment?.maxMarks}` : '-'}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleOpenGradeModal(sub)}
                      className="text-blue-500 hover:text-blue-400 transition-colors text-sm font-medium flex items-center justify-end w-full gap-2"
                    >
                      {sub.status === 'Graded' ? <><CheckCircle className="w-4 h-4" /> Edit Grade</> : <><Edit3 className="w-4 h-4" /> Grade</>}
                    </button>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ink-muted">
                    No submissions found for your assignments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Grade Modal */}
      {isModalOpen && activeSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-4">
              <h2 className="text-xl font-bold text-ink">Grade Submission</h2>
              <button onClick={handleCloseModal} className="text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6 space-y-4 text-sm">
              <div className="grid grid-cols-3">
                <span className="text-ink-muted">Student:</span>
                <span className="col-span-2 text-ink font-medium">{activeSubmission.student?.name}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-ink-muted">Assignment:</span>
                <span className="col-span-2 text-ink font-medium">{activeSubmission.assignment?.title}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-ink-muted">Submitted:</span>
                <span className="col-span-2 text-ink font-medium">{new Date(activeSubmission.submittedAt).toLocaleString()}</span>
              </div>
              
              <div className="bg-paper rounded-lg p-4 mt-2 border border-border">
                <h4 className="text-ink-muted font-medium mb-2 text-xs uppercase tracking-wider">Submission Content</h4>
                <p className="text-ink whitespace-pre-wrap">{activeSubmission.content || 'No text content provided.'}</p>
                {activeSubmission.fileUrl && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <a href={activeSubmission.fileUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                      View Attached File
                    </a>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-muted mb-1">
                  Marks (Out of {activeSubmission.assignment?.maxMarks})
                </label>
                <input 
                  type="number" 
                  min="0" 
                  max={activeSubmission.assignment?.maxMarks} 
                  required 
                  value={formData.marks} 
                  onChange={(e) => setFormData({ ...formData, marks: e.target.value })} 
                  className="w-full bg-paper border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ink-muted mb-1">Feedback</label>
                <textarea 
                  rows={4} 
                  value={formData.feedback} 
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })} 
                  placeholder="Great job on this assignment..."
                  className="w-full bg-paper border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-ink-muted hover:text-ink hover:bg-border/30 transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-ink px-4 py-2 rounded-lg transition-colors">Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
