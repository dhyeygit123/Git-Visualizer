import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { GitBranch, Upload, BarChart3, Settings, Home, FileText } from 'lucide-react';

const HomePage = ({ onPageChange }) => {
  return (
   <div className="max-w-4xl mx-auto p-6 space-y-8">
    <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900">Visualize Your Git Workflow Like Never Before
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Transform complex branching strategies into beautiful, interactive visualizations. Understand your team's workflow patterns and optimize your development process. 
        </p>
        <div className="flex justify-center space-x-4 pt-4">
          <Button size="lg" className="flex items-center space-x-2 min-w-[150px]" onClick={() => {
            onPageChange('upload')
          }}>
            <Upload className="h-5 w-5"/>
            <span>Get Started</span>
          </Button>
          <Button variant="outline" size="lg" className="min-w-[150px]">
            <span>View Demo</span>
          </Button>
        </div>
    </div>
          <Separator/>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                <GitBranch className="h-5 w-5 text-blue-600"/>
                  <span>Smart Visualization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                Automatically detect and visualize complex branching patterns with intelligent 
                layout algorithms that minimize visual clutter.
                </CardDescription>
              </CardContent>
            </Card>

            
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Workflow Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get insights into your team's development patterns, identify bottlenecks, 
              and optimize your branching strategy for better productivity.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Export & Share</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Generate beautiful reports and shareable visualizations to document 
              your workflow and communicate with stakeholders.
            </CardDescription>
          </CardContent>
        </Card>
          </div>

          <Separator />

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Why Choose GitFlow Visualizer?</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2"> 
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                <span>No installation required - runs in your browser</span>
             </div>
             <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              <span>AI-powered workflow pattern detection</span>
             </div>
             <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                <span>Beautiful, interactive visualizations</span>
             </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                <span>Team collaboration insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                <span>Export to multiple formats</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                 <span>Workflow optimization recommendations</span> 
              </div>
            </div>
            </div>
          </div>
   </div>
  )
}

export default HomePage