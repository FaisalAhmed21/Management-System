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
  createdAt: string;
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
    marks: 0,
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
      marks: submission.marks || 0,
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
      await api.put(`/submissions/${activeSubmission.id}/grade`, formData);
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
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">Graded</span>;
      case 'Late':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">Late</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">{status}</span>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Student Submissions</h1>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading submissions...</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/50 border-b border-gray-800">
                <th className="p-4 text-sm font-medium text-gray-400">Assignment</th>
                <th className="p-4 text-sm font-medium text-gray-400">Student</th>
                <th className="p-4 text-sm font-medium text-gray-400">Submitted At</th>
                <th className="p-4 text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-sm font-medium text-gray-400">Marks</th>
                <th className="p-4 text-sm font-medium text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="p-4 text-sm text-gray-200">
                    {sub.assignment?.title || `Assignment ID: ${sub.assignmentId}`}
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {sub.student?.name || `Student ID: ${sub.studentId}`}
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(sub.status)}
                  </td>
                  <td className="p-4 text-sm text-gray-400">
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
                  <td colSpan={6} className="p-8 text-center text-gray-500">
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
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-4">
              <h2 className="text-xl font-bold text-white">Grade Submission</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6 space-y-4 text-sm">
              <div className="grid grid-cols-3">
                <span className="text-gray-500">Student:</span>
                <span className="col-span-2 text-white font-medium">{activeSubmission.student?.name}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-500">Assignment:</span>
                <span className="col-span-2 text-white font-medium">{activeSubmission.assignment?.title}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-500">Submitted:</span>
                <span className="col-span-2 text-white font-medium">{new Date(activeSubmission.createdAt).toLocaleString()}</span>
              </div>
              
              <div className="bg-gray-950 rounded-lg p-4 mt-2 border border-gray-800">
                <h4 className="text-gray-500 font-medium mb-2 text-xs uppercase tracking-wider">Submission Content</h4>
                <p className="text-gray-300 whitespace-pre-wrap">{activeSubmission.content || 'No text content provided.'}</p>
                {activeSubmission.fileUrl && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <a href={activeSubmission.fileUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                      View Attached File
                    </a>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Marks (Out of {activeSubmission.assignment?.maxMarks})
                </label>
                <input 
                  type="number" 
                  min="0" 
                  max={activeSubmission.assignment?.maxMarks} 
                  required 
                  value={formData.marks} 
                  onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })} 
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Feedback</label>
                <textarea 
                  rows={4} 
                  value={formData.feedback} 
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })} 
                  placeholder="Great job on this assignment..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
