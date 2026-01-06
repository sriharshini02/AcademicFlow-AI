import { Controller, Get, Post, Put, Delete, Middleware } from '@overnightjs/core';
import db from '../models/index.js';
import { verifyToken } from '../middleware/jwt-auth.middleware.js';

@Controller('api/todo')
export class TodoController {
  @Get('/')
  @Middleware([verifyToken])
  async getAllTasks(req, res) {
    try {
      const tasks = await db.ToDoTask.findAll({
        where: { user_id: req.user.user_id },
        order: [['due_date', 'ASC'], ['createdAt', 'DESC']]
      });
      return res.success(tasks, 'Tasks fetched successfully');
    } catch (err) {
      throw err;
    }
  }

  @Post('/')
  @Middleware([verifyToken])
  async addTask(req, res) {
    try {
      const { title, priority, due_date } = req.body;
      const task = await db.ToDoTask.create({
        user_id: req.user.user_id,
        title,
        priority: priority || 'medium',
        due_date
      });
      return res.created(task, 'Task created successfully');
    } catch (err) {
      throw err;
    }
  }

  @Put('/:id')
  @Middleware([verifyToken])
  async updateTask(req, res) {
    try {
      const task = await db.ToDoTask.findByPk(req.params.id);
      if (!task) return res.notFound('Task not found');

      await task.update(req.body);
      return res.success(task, 'Task updated successfully');
    } catch (err) {
      throw err;
    }
  }

  @Delete('/:id')
  @Middleware([verifyToken])
  async deleteTask(req, res) {
    try {
      const task = await db.ToDoTask.findByPk(req.params.id);
      if (!task) return res.notFound('Task not found');

      await task.destroy();
      return res.success(null, 'Task deleted successfully');
    } catch (err) {
      throw err;
    }
  }
}

