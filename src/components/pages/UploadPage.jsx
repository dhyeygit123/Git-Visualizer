// // src/pages/UploadPage.js - UPDATED VERSION
// import React from 'react';
// import { FileUpload } from './FileUpload';

// const UploadPage = ({ onPageChange, onSetGitData }) => {
//   const handleVisualize = (files, parsedGitData) => {
//      console.log('Files ready for visualization:', files);
//       console.log('Parsed Git data:', parsedGitData);
    
//     // Store git data in app state
//     if (onSetGitData && parsedGitData) {
//       onSetGitData(parsedGitData);
//     }
    
//     // Navigate to visualizer
//     onPageChange('visualizer');
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <div className="text-center mb-8">
//         <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Repository</h2>
//         <p className="text-gray-600 text-lg">
//           Transform your Git workflow into beautiful visualizations
//         </p>
//       </div>
      
//       <FileUpload onVisualize={handleVisualize} />
//     </div>
//   );
// };

// export default UploadPage;



// src/pages/UploadPage.jsx - UPDATED VERSION
import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import GitHubUrlInput from './GithubUrl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Github } from 'lucide-react';

const UploadPage = ({ onPageChange, onSetGitData }) => {
  const [activeTab, setActiveTab] = useState('upload');

  const handleVisualize = (files, parsedGitData) => {
    console.log('Files ready for visualization:', files);
    console.log('Parsed Git data:', parsedGitData);
    
    // Store git data in app state
    if (onSetGitData && parsedGitData) {
      onSetGitData(parsedGitData);
    }
    
    // Navigate to visualizer
    onPageChange('visualizer');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Import Your Repository</h2>
        <p className="text-gray-600 text-lg">
          Transform your Git workflow into beautiful visualizations
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload ZIP File
          </TabsTrigger>
          <TabsTrigger value="github" className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            Import from GitHub
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Repository ZIP</h3>
            <p className="text-gray-600">
              Upload a ZIP file containing your Git repository with the .git folder
            </p>
          </div>
          <FileUpload onVisualize={handleVisualize} />
        </TabsContent>
        
        <TabsContent value="github" className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Import from GitHub</h3>
            <p className="text-gray-600">
              Enter a GitHub repository URL to automatically import and visualize
            </p>
          </div>
          <GitHubUrlInput onVisualize={handleVisualize} />
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">What you can visualize:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Commit history and branching patterns</li>
          <li>• Contributor activity and collaboration</li>
          <li>• Repository evolution over time</li>
          <li>• Branch relationships and merge patterns</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadPage;