import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch } from 'lucide-react';

 import { GitTimeline } from './GitTimeline';


const VisualizerPage = ({ onPageChange, gitData }) => {
  // If no git data is available, show the empty state
  console.log(gitData);
  if (!gitData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Git Workflow Visualization</h2>
          <p className="text-gray-600">Interactive visualization of your repository's branching strategy</p>
        </div>

        <Card className="h-96">
          <CardContent className="p-6 h-full">
            <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4">
                <GitBranch className="h-16 w-16 text-gray-400 mx-auto"/>
                <p className="text-lg text-gray-600">No repository loaded</p>
                <p className="text-sm text-gray-500">Upload a repository to see the visualization</p>
                <Button onClick={() => onPageChange('upload')}>
                  Upload Repository
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Visualization Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                Zoom to Fit
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                Filter Branches
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                Time Range
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Layout Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" disabled>Timeline View</Button>
              <Button variant="outline" size="sm" className="w-full justify-start" disabled>Subway Map</Button>
              <Button variant="outline" size="sm" className="w-full justify-start" disabled>Tree View</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" disabled>Export as PNG</Button>
              <Button variant="outline" size="sm" className="w-full justify-start" disabled>Export as PDF</Button>
              <Button variant="outline" size="sm" className="w-full justify-start" disabled>Share Link</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If git data is available, show the visualization
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Git Workflow Visualization</h2>
          <p className="text-gray-600">Interactive visualization of your repository's commit history</p>
        </div>
        <Button variant="outline" onClick={() => onPageChange('upload')}>
          Upload Another Repository
        </Button>
      </div>

      {/* Repository Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{gitData.commits?.length || 0}</div>
            <div className="text-sm text-gray-600">Commits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{gitData.branches?.length || 0}</div>
            <div className="text-sm text-gray-600">Branches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {[...new Set(gitData.commits?.map(c => c.author) || [])].length}
            </div>
            <div className="text-sm text-gray-600">Authors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{gitData.tags?.length || 0}</div>
            <div className="text-sm text-gray-600">Tags</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Visualization */}
      <GitTimeline gitData={gitData} />
    </div>
  );
};

export default VisualizerPage;