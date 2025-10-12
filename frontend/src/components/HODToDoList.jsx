import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../App.jsx';
import { Trash2, Edit, Plus } from 'lucide-react';


const API_URL = 'http://localhost:5000/api/todo';

const HODToDoList = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', due_date: '' });
  const [editingId, setEditingId] = useState(null);

  // --- Fetch tasks ---
  const fetchTasks = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  // --- Add / Update Task ---
  const handleSave = async () => {
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, newTask, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(API_URL, newTask, { headers: { Authorization: `Bearer ${token}` } });
      }
      setNewTask({ title: '', priority: 'medium', due_date: '' });
      setEditingId(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Delete Task ---
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Edit Task ---
  const handleEdit = (task) => {
    setEditingId(task.task_id);
    setNewTask({ title: task.title, priority: task.priority, due_date: task.due_date ? task.due_date.split('T')[0] : '' });
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-bold mb-3">To-Do List</h3>

      {/* Add / Edit Form */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="p-2 border rounded w-full md:w-1/2"
        />
        <input
          type="date"
          value={newTask.due_date}
          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
          className="p-2 border rounded"
        />
        <select
          value={newTask.priority}
          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button onClick={handleSave} className="bg-indigo-600 text-white px-3 py-1 rounded flex items-center">
          <Plus className="w-4 h-4 mr-1" /> {editingId ? 'Update' : 'Add'}
        </button>
      </div>

      {/* Tasks List */}
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.task_id} className="flex justify-between items-center p-2 border rounded bg-white">
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-gray-500">
                  Priority: {task.priority} | Due: {task.due_date ? task.due_date.split('T')[0] : 'N/A'}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(task)} className="text-blue-500">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(task.task_id)} className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HODToDoList;
