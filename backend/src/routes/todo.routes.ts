import express from 'express';
import db from '../models/index';
import { verifyToken } from '../middleware/jwt-auth';

const router = express.Router();

// --- Get all tasks for logged-in HOD ---
router.get('/', verifyToken, async (req, res) => {
    try {
        const tasks = await db.ToDoTask.findAll({
            where: { user_id: req.body.user.user_id },
            order: [['due_date', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
});

// --- Add new task ---
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, priority, due_date } = req.body;
        const task = await db.ToDoTask.create({
            user_id: req.body.user.user_id,
            title,
            priority: priority || 'medium',
            due_date
        });
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add task' });
    }
});

// --- Update task ---
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const task = await db.ToDoTask.findByPk(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        await task.update(req.body);
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update task' });
    }
});

// --- Delete task ---
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const task = await db.ToDoTask.findByPk(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        await task.destroy();
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete task' });
    }
});

export default router;
