import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, GitBranch, FileArchive, HelpCircle } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { UploadProgress } from './UploadProgress';

export const FileUpload = ({ onVisualize }) => {
  const fileInputRef = useRef(null);
  const { uploadState, handleDragOver, handleDragLeave, handleDrop, handleFileSelect, resetUpload } = useFileUpload();

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleVisualize = (file, gitData) => {
    if (uploadState.uploadedFiles && onVisualize) {
      console.log(uploadState.uploadedFiles)
      console.log(file)
      onVisualize(uploadState.uploadedFiles, gitData);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Git Repository</span>
          </CardTitle>
          <CardDescription>
            Upload your Git repository to start visualizing your workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Progress */}
          <UploadProgress 
            uploadState={uploadState}
            onReset={resetUpload}
            onVisualize={handleVisualize}
          />

          {/* Upload Area */}
          {!uploadState.success && (
            <div 
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
                uploadState.isDragging 
                  ? 'border-blue-400 bg-blue-50 scale-105' 
                  : 'border-gray-300 hover:border-gray-400'
              } ${uploadState.isUploading ? 'pointer-events-none opacity-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className={`p-3 rounded-full ${
                    uploadState.isDragging ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Upload className={`h-8 w-8 ${
                      uploadState.isDragging ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {uploadState.isDragging ? 'Drop your repository here!' : 'Drag and drop your repository'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">or</p>
                  <Button 
                    onClick={handleChooseFiles}
                    disabled={uploadState.isUploading}
                    className="relative"
                  >
                    Choose Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip,.tar.gz,.tar"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <FileArchive className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Supported Formats</p>
                  <ul className="text-gray-600 text-xs space-y-1 mt-1">
                    <li>• .zip files containing .git folder</li>
                    <li>• Complete repository archives</li>
                    <li>• .tar.gz compressed repositories</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <HelpCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">How to Export</p>
                  <ul className="text-gray-600 text-xs space-y-1 mt-1">
                    <li>• Zip your entire project folder</li>
                    <li>• Or zip just the .git folder</li>
                    <li>• Max file size: 100MB</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">100% Local Processing</p>
                <p className="text-xs text-green-700 mt-1">
                  Your repository data is processed entirely in your browser. Nothing is uploaded to our servers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <GitBranch className="h-4 w-4" />
            <span>Quick Start Guide</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">1</div>
              <p className="text-gray-700">Navigate to your Git repository folder on your computer</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">2</div>
              <p className="text-gray-700">Create a .zip file of your project (or just the .git folder)</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">3</div>
              <p className="text-gray-700">Drag and drop the .zip file above or click "Choose Files"</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">4</div>
              <p className="text-gray-700">Click "Visualize Repository" to see your Git workflow!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};