// frontend/src/components/PracticeTemplates.js
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import MicIcon from '@mui/icons-material/Mic';
import TimerIcon from '@mui/icons-material/Timer';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const PracticeTemplates = ({ onTemplateSelect }) => {
  const templates = [
    {
      id: 'job-interview',
      title: 'Job Interview',
      icon: <BusinessCenterIcon />,
      description: 'Practice common interview questions and responses',
      duration: '3-5 minutes',
      difficulty: 'Intermediate',
      prompts: [
        "Tell me about yourself and your experience.",
        "Why do you want to work at our company?",
        "Describe a challenging project you worked on.",
        "Where do you see yourself in 5 years?"
      ]
    },
    {
      id: 'presentation',
      title: 'Business Presentation',
      icon: <GroupsIcon />,
      description: 'Practice delivering a professional presentation',
      duration: '5-7 minutes',
      difficulty: 'Advanced',
      prompts: [
        "Good morning everyone, today I'll be presenting...",
        "The main challenge we're addressing is...",
        "Our solution offers three key benefits...",
        "In conclusion, I recommend we proceed with..."
      ]
    },
    {
      id: 'elevator-pitch',
      title: 'Elevator Pitch',
      icon: <TimerIcon />,
      description: 'Craft and deliver a compelling 60-second pitch',
      duration: '1 minute',
      difficulty: 'Beginner',
      prompts: [
        "Hi, I'm [Name] and I work on...",
        "We help [target audience] solve [problem]...",
        "What makes us unique is...",
        "I'd love to schedule a follow-up conversation..."
      ]
    },
    {
      id: 'public-speaking',
      title: 'Public Speaking',
      icon: <MicIcon />,
      description: 'Practice for conferences, talks, or events',
      duration: '7-10 minutes',
      difficulty: 'Advanced',
      prompts: [
        "Thank you for that wonderful introduction.",
        "Today, I want to share something important with you...",
        "Let me tell you a story that illustrates this point...",
        "I'll leave you with this final thought..."
      ]
    },
    {
      id: 'casual-conversation',
      title: 'Casual Conversation',
      icon: <SchoolIcon />,
      description: 'Practice everyday social interactions',
      duration: '2-3 minutes',
      difficulty: 'Beginner',
      prompts: [
        "How was your weekend? I spent mine...",
        "Have you seen any good movies or shows lately?",
        "I recently started a new hobby...",
        "What are your thoughts on [current topic]?"
      ]
    },
    {
      id: 'custom',
      title: 'Custom Practice',
      icon: <ContentCopyIcon />,
      description: 'Create your own practice scenario',
      duration: 'Custom',
      difficulty: 'Any',
      prompts: []
    }
  ];

  const handleTemplateSelect = (template) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        📚 Practice Templates
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose a template to practice specific speaking scenarios. Perfect for interviews, presentations, or casual conversations.
      </Typography>
      
      <Grid container spacing={2}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {template.icon}
                  </Box>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {template.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip 
                        label={template.duration} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                      <Chip 
                        label={template.difficulty} 
                        size="small" 
                        color={template.difficulty === 'Beginner' ? 'success' : 
                               template.difficulty === 'Intermediate' ? 'warning' : 'error'}
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Box>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>
                
                {template.prompts.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Example prompts:
                    </Typography>
                    {template.prompts.slice(0, 2).map((prompt, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          p: 1, 
                          mb: 1, 
                          bgcolor: 'background.paper', 
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="caption" sx={{ flexGrow: 1 }}>
                          "{prompt.substring(0, 40)}..."
                        </Typography>
                        <Tooltip title="Copy prompt">
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(prompt);
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
              
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  fullWidth 
                  variant={template.id === 'custom' ? 'outlined' : 'contained'}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateSelect(template);
                  }}
                >
                  {template.id === 'custom' ? 'Create Custom' : 'Use This Template'}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default PracticeTemplates;