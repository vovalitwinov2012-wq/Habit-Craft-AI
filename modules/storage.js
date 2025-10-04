import express from 'express';

const router = express.Router();

// Simple in-memory storage
let userData = {
  habits: [],
  settings: {},
  statistics: {}
};

// Get all user data
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: userData,
    timestamp: new Date().toISOString()
  });
});

// Save user data
router.post('/', (req, res) => {
  try {
    const { habits, settings, statistics } = req.body;
    
    if (habits) userData.habits = habits;
    if (settings) userData.settings = { ...userData.settings, ...settings };
    if (statistics) userData.statistics = { ...userData.statistics, ...statistics };

    res.json({
      success: true,
      message: 'Data saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Reset storage
router.delete('/reset', (req, res) => {
  try {
    userData = {
      habits: [],
      settings: {},
      statistics: {}
    };

    res.json({
      success: true,
      message: 'Storage reset successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset storage' });
  }
});

// Get statistics
router.get('/stats', (req, res) => {
  const totalHabits = userData.habits.length;
  const completedHabits = userData.habits.filter(h => h.completed > 0).length;
  const totalCompletions = userData.habits.reduce((sum, h) => sum + h.completed, 0);
  const longestStreak = Math.max(...userData.habits.map(h => h.streak), 0);

  res.json({
    success: true,
    statistics: {
      totalHabits,
      completedHabits,
      totalCompletions,
      longestStreak,
      habitsByFrequency: userData.habits.reduce((acc, h) => {
        acc[h.frequency] = (acc[h.frequency] || 0) + 1;
        return acc;
      }, {})
    }
  });
});

export default router;