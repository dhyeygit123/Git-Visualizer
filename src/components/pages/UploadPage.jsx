// src/pages/UploadPage.js - UPDATED VERSION
import React from 'react';
import { FileUpload } from './FileUpload';

const UploadPage = ({ onPageChange, onSetGitData }) => {
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Repository</h2>
        <p className="text-gray-600 text-lg">
          Transform your Git workflow into beautiful visualizations
        </p>
      </div>
      
      <FileUpload onVisualize={handleVisualize} />
    </div>
  );
};

export default UploadPage;