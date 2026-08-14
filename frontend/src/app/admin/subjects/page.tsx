'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

interface Subject {
  id: number;
  name: string;
  classCourseId: number;
  classCourse?: {
    name: string;
  };
}

interface ClassCourse {
  id: number;
  name: string;
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', classCourseId: '' });

  const fetchData = async () => {
    try {
      const [subRes, clsRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/classes')
      ]);
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

  const handleOpenModal = (sub?: Subject) => {
    if (sub) {
      setEditingId(sub.id);
      setFormData({ name: sub.name, classCourseId: sub.classCourseId.toString() });
    } else {
      setEditingId(null);
      setFormData({ name: '', classCourseId: classes.length > 0 ? classes[0].id.toString() : '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        classCourseId: parseInt(formData.classCourseId)
      };
      if (editingId) {
        await api.put(`/subjects/${editingId}`, { id: editingId, ...payload });
      } else {
        await api.post('/subjects', payload);
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save subject', error);
      alert('Failed to save subject');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete subject', error);
      alert('Failed to delete subject');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink">Manage Subjects</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-ink px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      {loading ? (
        <div className="text-ink-muted">Loading subjects...</div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-border/20 border-b border-border">
                <th className="p-4 text-sm font-medium text-ink-muted">Subject Name</th>
                <th className="p-4 text-sm font-medium text-ink-muted">Class/Course</th>
                <th className="p-4 text-sm font-medium text-ink-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-border/30 transition-colors">
                  <td className="p-4 text-sm text-ink">{sub.name}</td>
                  <td className="p-4 text-sm text-ink-muted">
                    {classes.find(c => c.id === sub.classCourseId)?.name || `ID: ${sub.classCourseId}`}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleOpenModal(sub)}
                      className="text-ink-muted hover:text-blue-400 transition-colors mr-3"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(sub.id)}
                      className="text-ink-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-ink-muted">
                    No subjects found.
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
          <div className="bg-surface border border-border rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-ink">
                {editingId ? 'Edit Subject' : 'Add Subject'}
              </h2>
              <button onClick={handleCloseModal} className="text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-muted mb-1">Subject Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-paper border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-muted mb-1">Class/Course</label>
                <select required value={formData.classCourseId} onChange={(e) => setFormData({ ...formData, classCourseId: e.target.value })} className="w-full bg-paper border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-blue-500">
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-ink-muted hover:text-ink hover:bg-border/30 transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-ink px-4 py-2 rounded-lg transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
