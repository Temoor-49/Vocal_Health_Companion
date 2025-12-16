// frontend/src/components/ProgressChart.js
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const ProgressChart = ({ data, backendUrl }) => {
  const [timeRange, setTimeRange] = React.useState('7days');
  const [chartData, setChartData] = React.useState(data || []);

  const timeRanges = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: 'all', label: 'All Time' }
  ];

  // If no data provided, show placeholder
  if (!data || data.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Progress Analytics</Typography>
          <Button variant="outlined" size="small">
            Start Tracking Progress
          </Button>
        </Box>
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">
            Record and analyze speeches to see your progress chart here.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          📈 Your Speaking Progress
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              {timeRanges.map((range) => (
                <MenuItem key={range.value} value={range.value}>
                  {range.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => window.print()}
          >
            Export Chart
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorClarity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              domain={[0, 10]}
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: 8
              }}
            />
            <Legend />
            
            <Area
              type="monotone"
              dataKey="clarity"
              name="Clarity Score"
              stroke="#8B5CF6"
              fillOpacity={1}
              fill="url(#colorClarity)"
              strokeWidth={2}
            />
            
            <Area
              type="monotone"
              dataKey="confidence"
              name="Confidence Score"
              stroke="#10B981"
              fillOpacity={1}
              fill="url(#colorConfidence)"
              strokeWidth={2}
            />
            
            <Line
              type="monotone"
              dataKey="fillerWords"
              name="Filler Words"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Track your improvement in clarity, confidence, and filler word reduction
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Higher scores indicate better speaking performance
        </Typography>
      </Box>
    </Paper>
  );
};

export default ProgressChart;