import express from 'express';

const router = express.Router();

// Get UI configuration
router.get('/config', (req, res) => {
  res.json({
    success: true,
    config: {
      theme: {
        primaryColor: '#4F46E5',
        secondaryColor: '#6366F1',
        backgroundColor: '#F9FAFB',
        textColor: '#111827'
      },
      layout: {
        header: true,
        footer: true,
        sidebar: false
      },
      features: {
        aiCoach: true,
        habitTracking: true,
        statistics: true,
        notifications: true
      }
    }
  });
});

// Update UI settings
router.post('/settings', (req, res) => {
  try {
    const { theme, layout, features } = req.body;
    
    // Here you would typically save to database
    // For now, just return the updated settings
    
    res.json({
      success: true,
      settings: {
        theme: theme || {},
        layout: layout || {},
        features: features || {}
      },
      message: 'UI settings updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update UI settings' });
  }
});

// Get available themes
router.get('/themes', (req, res) => {
  res.json({
    success: true,
    themes: [
      {
        id: 'light',
        name: 'Light Theme',
        colors: {
          primary: '#4F46E5',
          background: '#FFFFFF',
          text: '#111827'
        }
      },
      {
        id: 'dark',
        name: 'Dark Theme',
        colors: {
          primary: '#6366F1',
          background: '#1F2937',
          text: '#F9FAFB'
        }
      },
      {
        id: 'blue',
        name: 'Blue Theme',
        colors: {
          primary: '#3B82F6',
          background: '#EFF6FF',
          text: '#1E40AF'
        }
      }
    ]
  });
});

export default router;