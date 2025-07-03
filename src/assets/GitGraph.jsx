import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const GitGraph = () => {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <Card className="p-6 text-center shadow-lg">
        <CardContent>
          <h1 className="text-3xl font-bold mb-2">Coming Soon</h1>
          <p className="text-muted-foreground">Git Graph visualization is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GitGraph;