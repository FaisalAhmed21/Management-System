'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, Edit2, X, Calendar } from 'lucide-react';

interface Assignment {
  id: number;
  title: string;
  description: string;
  subjectId: number;
  classCourseId: number;
  deadline: string;
  maxMarks: number;
  status: string;
  allowLateSubmissions: boolean;
}

interface TeacherAssignment {
  id: number;
  teacherId: number;
  subjectId: number;
  classCourseId: number;
}

interface Subject {
  id: number;
  name: string;
  classCourseId: number;
}

interface ClassCourse {
  id: number;
  name: string;
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [myTeacherAssignments, setMyTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectAndClass: '', // combined string format "subjectId-classCourseId"
    deadline: '',
    maxMarks: 100 as string | number,
    status: 'Draft',
    allowLateSubmissions: false
  });

  const fetchData = async () => {
    try {
      const [assRes, myMappingsRes, subRes, clsRes] = await Promise.all([
        api.get('/assignments/mine'),
        api.get('/teacher-assignments/mine'),
        api.get('/subjects'),
        api.get('/classes')
      ]);
      setAssignments(assRes.data);
      setMyTeacherAssignments(myMappingsRes.data);
      setSubjects(subRes.data);
      setClasses(clsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to format date for input field
  const formatDateForInput = (isoString: string) => {
    const date = new Date(isoString);
    // local string formatted for datetime-local
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const handleOpenModal = (assignment?: Assignment) => {
    if (assignment) {
      setEditingId(assignment.id);
      setFormData({
        title: assignment.title,
        description: assignment.description,
        subjectAndClass: `${assignment.subjectId}-${assignment.classCourseId}`,
        deadline: formatDateForInput(assignment.deadline),
        maxMarks: assignment.maxMarks,
        status: assignment.status,
        allowLateSubmissions: assignment.allowLateSubmissions
      });
    } else {
      setEditingId(null);
      const defaultMapping = myTeacherAssignments.length > 0 
        ? `${myTeacherAssignments[0].subjectId}-${myTeacherAssignments[0].classCourseId}`
        : '';
      setFormData({
        title: '',
        description: '',
        subjectAndClass: defaultMapping,
        deadline: '',
        maxMarks: 100,
        status: 'Draft',
        allowLateSubmissions: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const [subjectId, classCourseId] = formData.subjectAndClass.split('-');
      const payload = {
        title: formData.title,
        description: formData.description,
        subjectId: parseInt(subjectId),
        classCourseId: parseInt(classCourseId),
        deadline: new Date(formData.deadline).toISOString(),
        maxMarks: Number(formData.maxMarks),
        status: formData.status,
        allowLateSubmissions: formData.allowLateSubmissions
      };

      if (editingId) {
        await api.put(`/assignments/${editingId}`, payload);
      } else {
        await api.post('/assignments', payload);
      }
      fetchData();
      handleCloseModal();
    } catch (error: any) {
      console.error('Failed to save assignment', error);
      alert(error.response?.data?.message || 'Failed to save assignment');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete assignment', error);
      alert('Failed to delete assignment');
    }
  };

  // Helper to get name
  const getSubjectName = (id: number) => subjects.find(s => s.id === id)?.name || `ID ${id}`;
  const getClassName = (id: number) => classes.find(c => c.id === id)?.name || `ID ${id}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink">My Assignments</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-ink px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      {loading ? (
        <div className="text-ink-muted">Loading assignments...</div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-border/20 border-b border-border">
                <th className="p-4 text-sm font-medium text-ink-muted">Title</th>
                <th className="p-4 text-sm font-medium text-ink-muted">Subject</th>
                <th className="p-4 text-sm font-medium text-ink-muted">Class</th>
                <th className="p-4 text-sm font-medium text-ink-muted">Deadline</th>
                <th className="p-4 text-sm font-medium text-ink-muted">Status</th>
                <th className="p-4 text-sm font-medium text-ink-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-border/30 transition-colors">
                  <td className="p-4 text-sm text-ink">{assignment.title}</td>
                  <td className="p-4 text-sm text-ink-muted">{getSubjectName(assignment.subjectId)}</td>
                  <td className="p-4 text-sm text-ink-muted">{getClassName(assignment.classCourseId)}</td>
                  <td className="p-4 text-sm text-ink-muted">{new Date(assignment.deadline).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`\${
                      assignment.status === 'Published' ? 'rubber-stamp-green' : 'rubber-stamp-gray'
                    }`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleOpenModal(assignment)}
                      className="text-ink-muted hover:text-blue-400 transition-colors mr-3"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(assignment.id)}
                      className="text-ink-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ink-muted">
                    No assignments found. Click "Create Assignment" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-ink">
                {editingId ? 'Edit Assignment' : 'Create Assignment'}
              </h2>
              <button onClick={handleCloseModal} className="text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {myTeacherAssignments.length === 0 ? (
              <div className="text-yellow-500 mb-4 p-4 bg-yellow-500/10 rounded-lg">
                You have not been assigned to any classes or subjects yet. Please contact an admin.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-ink-muted mb-1">Title</label>
                    <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-paper border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-blue-500" />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-ink-muted mb-1">Description</label>
                    <textarea rows={4} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-paper border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-blue-500" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-ink-muted mb-1">Subject & Class Mapping</label>
                    <select required value={formData.subjectAndClass} onChange={(e) => setFormData({ ...formData, subjectAndClass: e.target.value })} className="w-full bg-paper border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-blue-500">
                      <option value="" disabled>Select your assigned subject/class</option>
                      {myTeacherAssignments.map(map => (
                        <option key={map.id} value={`${map.subjectId}-${map.classCourseId}`}>
                          {getSubjectName(map.subjectId)} — {getClassName(map.classCourseId)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-ink-muted mt-1">You can only create assignments for classes you are assigned to teach.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-muted mb-1">Deadline</label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-ink-muted pointer-events-none" />
                      <input type="datetime-local" required value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="w-full bg-paper border border-border rounded-lg pl-4 pr-10 py-2 text-ink focus:outline-none focus:border-blue-500 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [color-scheme:dark]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-muted mb-1">Max Marks</label>
                    <input type="number" min="0" required value={formData.maxMarks} onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })} className="w-full bg-paper border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-muted mb-1">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-paper border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-blue-500">
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>

                  <div className="flex items-center mt-6">
                    <input type="checkbox" id="lateSubmit" checked={formData.allowLateSubmissions} onChange={(e) => setFormData({ ...formData, allowLateSubmissions: e.target.checked })} className="w-4 h-4 rounded border-border bg-paper" />
                    <label htmlFor="lateSubmit" className="ml-2 text-sm font-medium text-ink-muted">Allow late submissions?</label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-ink-muted hover:text-ink hover:bg-border/30 transition-colors">Cancel</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-ink px-4 py-2 rounded-lg transition-colors">Save Assignment</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
