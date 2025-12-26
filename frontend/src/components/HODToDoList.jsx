import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../App.jsx';
import { Trash2, Edit, Plus, LayoutList, Calendar, Flag } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/todo';

const HODToDoList = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', due_date: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchTasks = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [token]);

  const handleSave = async () => {
    if (!newTask.title) return;
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, newTask, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(API_URL, newTask, { headers: { Authorization: `Bearer ${token}` } });
      }
      setNewTask({ title: '', priority: 'medium', due_date: '' });
      setEditingId(null);
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (task) => {
    setEditingId(task.task_id);
    setNewTask({ title: task.title, priority: task.priority, due_date: task.due_date ? task.due_date.split('T')[0] : '' });
  };

  return (
    <div className="p-6 rounded-[1.5rem] neu-raised border border-white/20 dark:border-slate-800/50 h-full flex flex-col transition-all duration-500">
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="p-2 rounded-xl neu-inset text-indigo-500 dark:text-cyan-400">
          <LayoutList size={18} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">Task Queue</h3>
      </div>

      {/* OPTIMIZED COMPACT FORM: Maximized Text Area */}
      <div className="mb-8 p-2 rounded-2xl neu-inset bg-[#f0f9f4] dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/20">
        <div className="flex flex-row items-center gap-2">
          
          {/* Title Input: Takes up maximum available space */}
          <div className="flex-[3] min-w-0">
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-transparent border-none outline-none text-sm font-medium text-slate-700 dark:text-slate-200"
            />
          </div>
          
          {/* Date Input: Slimmed width */}
          <div className="flex-none flex items-center gap-1.5 px-2 border-l border-emerald-200/50 dark:border-emerald-800/30">
            <Calendar size={14} className="text-emerald-600/60" />
            <input
              type="date"
              value={newTask.due_date}
              onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              className="bg-transparent border-none outline-none text-[11px] text-slate-500 dark:text-slate-400 w-28"
            />
          </div>
          
          {/* Priority Select: Compact width */}
          <div className="flex-none flex items-center gap-1.5 px-2 border-l border-emerald-200/50 dark:border-emerald-800/30">
            <Flag size={14} className="text-emerald-600/60" />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="bg-transparent border-none outline-none text-[11px] font-bold uppercase tracking-tighter text-slate-500 dark:text-slate-400 cursor-pointer w-20"
            >
              <option value="high">High</option>
              <option value="medium">Mid</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Add Button: Minimized to icon-label hybrid */}
          <button 
            onClick={handleSave} 
            className="btn-vivid h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-all flex-none shrink-0"
          >
            <Plus size={16} />
            <span className="text-[10px] font-black">{editingId ? 'UPDATE' : 'ADD'}</span>
          </button>
        </div>
      </div>

      {/* Task List items remain optimized */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 min-h-[250px]">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-400 gap-2">
            <Plus className="animate-spin" /> <span>Syncing...</span>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.task_id} className="group flex justify-between items-center p-4 rounded-2xl neu-raised dark:bg-white/[0.02] border border-white/10 transition-all hover:translate-x-1">
                <div className="flex items-center gap-4">
                  <div className={`w-1 h-8 rounded-full ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-tight">{task.title}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                      {task.priority} • {task.due_date ? task.due_date.split('T')[0] : 'No Date'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(task)} className="p-2 rounded-lg neu-raised text-blue-500"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(task.task_id)} className="p-2 rounded-lg neu-raised text-rose-500"><Trash2 size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HODToDoList;