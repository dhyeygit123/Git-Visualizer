// src/components/upload/UploadProgress.js - UPDATED VERSION
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, FileText, GitBranch, Users, Clock } from 'lucide-react';

export const UploadProgress = ({ uploadState, onReset, onVisualize }) => {
  const { isUploading, progress, uploadedFiles, parsedGitData, error, success, parsingStep } = uploadState;

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="ml-4"
            >
              Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (success && uploadedFiles && parsedGitData) {
    const stats = getGitStats(parsedGitData);
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-3">
              <span className="font-medium">Repository parsed successfully!</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
              >
                Upload Another
              </Button>
            </div>

            {/* Repository Statistics */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-medium text-green-900 mb-3 flex items-center">
                <GitBranch className="h-4 w-4 mr-2" />
                Repository Overview
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{stats.totalCommits}</div>
                  <div className="text-green-600">Commits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">{stats.totalBranches}</div>
                  <div className="text-blue-600">Branches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700">{stats.authors.length}</div>
                  <div className="text-purple-600">Authors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-700">{stats.totalTags}</div>
                  <div className="text-orange-600">Tags</div>
                </div>
              </div>

              {/* Branch List */}
              {stats.branches.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-green-900 mb-2">Branches:</div>
                  <div className="flex flex-wrap gap-2">
                    {stats.branches.slice(0, 5).map((branch, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {branch.name}
                      </span>
                    ))}
                    {stats.branches.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{stats.branches.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Commits Preview */}
              {stats.recentCommits.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-green-900 mb-2">Recent Commits:</div>
                  <div className="space-y-2">
                    {stats.recentCommits.slice(0, 3).map((commit, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-700">
                        <div className="w-16 font-mono text-gray-500">{commit.shortHash}</div>
                        <div className="flex-1 ml-2">{commit.message}</div>
                        <div className="text-gray-500 ml-2">{commit.author}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded Files */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Uploaded files:</p>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <FileText className="h-3 w-3" />
                  <span>{file.name}</span>
                  <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => onVisualize(uploadedFiles, parsedGitData)}
              className="w-full"
              size="sm"
            >
              Visualize Repository
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (isUploading) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Processing repository...</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-blue-600">
              {parsingStep || 'Extracting git data and preparing visualization...'}
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

// Helper function to extract statistics from parsed git data
function getGitStats(gitData) {
  return {
    totalCommits: gitData.commits?.length || 0,
    totalBranches: gitData.branches?.length || 0,
    totalTags: gitData.tags?.length || 0,
    authors: [...new Set(gitData.commits?.map(c => c.author) || [])],
    branches: gitData.branches || [],
    recentCommits: gitData.commits?.slice(-5).reverse() || []
  };
}