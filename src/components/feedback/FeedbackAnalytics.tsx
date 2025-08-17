
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ARCHIVED: Legacy feedback analytics component
// Tables moved to archive schema: archive.image_feedback
// Component kept for reference but functionality disabled
const FeedbackAnalytics: React.FC = () => {
  // Mock data for display purposes since real data is archived
  const mockData = [
    { name: 'Likes', value: 0 },
    { name: 'Dislikes', value: 0 },
  ];

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          Feedback Analytics
          <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
            ARCHIVED
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-white/70 mb-4">
          Legacy feedback analytics have been archived. Tables moved to archive schema.
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
            <YAxis stroke="rgba(255,255,255,0.7)" />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="value" fill="rgba(153, 69, 255, 0.5)" />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 text-xs text-white/50">
          New analytics system will be implemented with updated feedback collection.
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackAnalytics;
