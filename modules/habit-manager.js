import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// In-memory storage (in production use proper database)
let habits = [];

// Get all habits
router.get('/', (req, res) => {
  res.json({
    success: true,
    habits: habits,
    count: habits.length
  });
});

// Create new habit
router.post('/', (req, res) => {
  try {
    const { name, description, frequency, goal } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Habit name is required' });
    }

    const newHabit = {
      id: uuidv4(),
      name,
      description: description || '',
      frequency: frequency || 'daily',
      goal: goal || 1,
      createdAt: new Date().toISOString(),
      completed: 0,
      streak: 0,
      lastCompleted: null
    };

    habits.push(newHabit);

    res.status(201).json({
      success: true,
      habit: newHabit
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// Update habit
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const habitIndex = habits.findIndex(h => h.id === id);
    
    if (habitIndex === -1) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    habits[habitIndex] = { ...habits[habitIndex], ...updates };

    res.json({
      success: true,
      habit: habits[habitIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

// Mark habit as completed
router.post('/:id/complete', (req, res) => {
  try {
    const { id } = req.params;
    
    const habitIndex = habits.findIndex(h => h.id === id);
    
    if (habitIndex === -1) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const now = new Date();
    habits[habitIndex].completed++;
    habits[habitIndex].lastCompleted = now.toISOString();

    // Simple streak calculation
    const lastCompleted = habits[habitIndex].lastCompleted ? new Date(habits[habitIndex].lastCompleted) : null;
    if (!lastCompleted || (now - lastCompleted) <= 86400000 * 2) { // 2 days tolerance
      habits[habitIndex].streak++;
    } else {
      habits[habitIndex].streak = 1;
    }

    res.json({
      success: true,
      habit: habits[habitIndex],
      message: 'Habit marked as completed'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete habit' });
  }
});

// Delete habit
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const habitIndex = habits.findIndex(h => h.id === id);
    
    if (habitIndex === -1) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    habits.splice(habitIndex, 1);

    res.json({
      success: true,
      message: 'Habit deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

export default router;