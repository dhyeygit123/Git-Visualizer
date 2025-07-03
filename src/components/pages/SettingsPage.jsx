import {React, useState} from 'react'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { GitBranch, Upload, BarChart3, Settings, Home, FileText} from "lucide-react";


const SettingsPage = () => {
    const [settings, setSettings] = useState({
      theme: 'light',
      animationSpeed: 'normal',
      maxCommits: 1000,
      branchLimit: 50
    });
  
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
          <p className="text-gray-600">Configure your visualization preferences</p>
        </div>
  
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visualization Settings</CardTitle>
              <CardDescription>Customize how your Git workflow is displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Theme</label>
                    <p className="text-xs text-gray-500">Choose your preferred color scheme</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {settings.animationSpeed}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
              <CardDescription>Optimize performance for large repositories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Maximum Commits</label>
                    <p className="text-xs text-gray-500">Limit commits loaded for better performance</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {settings.maxCommits}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Branch Limit</label>
                    <p className="text-xs text-gray-500">Maximum number of branches to display</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {settings.branchLimit}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>Control how your data is handled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Local Processing</p>
                    <p className="text-xs text-green-700 mt-1">
                      All repository analysis happens locally in your browser. Your code never leaves your device.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Clear Cache</label>
                    <p className="text-xs text-gray-500">Remove stored visualization data</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Clear
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Export Settings</label>
                    <p className="text-xs text-gray-500">Save your preferences</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
  
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline">Reset to Defaults</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    );
  };

export default SettingsPage