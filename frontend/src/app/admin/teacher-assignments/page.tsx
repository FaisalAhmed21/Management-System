'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, X } from 'lucide-react';

interface TeacherAssignment {
  id: number;
  teacherId: number;
  subjectId: number;
  classCourseId: number;
}

interface User {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
  classCourseId: number;
}

export default function AdminTeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ teacherId: '', subjectId: '' });

  const fetchData = async () => {
    try {
      const [assRes, usrRes, subRes, clsRes] = await Promise.all([
        api.get('/teacher-assignments'),
        api.get('/users?role=Teacher'),
        api.get('/subjects'),
        api.get('/classes')
      ]);
      setAssignments(assRes.data);
      setTeachers(usrRes.data);
      setSubjects(subRes.data);
      setClasses(clsRes.data);
    } catch (error) {
      console.error('Failed to fetch teacher assignments data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setFormData({ 
      teacherId: teachers.length > 0 ? teachers[0].id.toString() : '', 
      subjectId: subjects.length > 0 ? subjects[0].id.toString() : '' 
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sub = subjects.find(s => s.id.toString() === formData.subjectId);
      if (!sub) return;

      const payload = {
        teacherId: parseInt(formData.teacherId),
        subjectId: parseInt(formData.subjectId),
        classCourseId: sub.classCourseId // Derived from subject automatically
      };
      
      await api.post('/teacher-assignments', payload);
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to assign teacher', error);
      alert('Failed to assign teacher');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;
    try {
      await api.delete(`/teacher-assignments/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete assignment', error);
      alert('Failed to delete assignment');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Teacher Assignments</h1>
        <button 
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Assign Teacher
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading assignments...</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/50 border-b border-gray-800">
                <th className="p-4 text-sm font-medium text-gray-400">Teacher</th>
                <th className="p-4 text-sm font-medium text-gray-400">Subject</th>
                <th className="p-4 text-sm font-medium text-gray-400">Class/Course</th>
                <th className="p-4 text-sm font-medium text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="p-4 text-sm text-gray-200">
                    {teachers.find(t => t.id === assignment.teacherId)?.name || `ID: ${assignment.teacherId}`}
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {subjects.find(s => s.id === assignment.subjectId)?.name || `ID: ${assignment.subjectId}`}
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {classes.find(c => c.id === assignment.classCourseId)?.name || `ID: ${assignment.classCourseId}`}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(assignment.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No teacher assignments found.
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
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Assign Teacher</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Teacher</label>
                <select required value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                <select required value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} (Class {s.classCourseId})</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
