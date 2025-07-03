import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitBranch, GitCommit, User, Calendar, Hash, Clock } from 'lucide-react';

import InteractiveCommitTimeline from '../../assets/GitVisuals';

// Main Timeline Component
export const GitTimeline = ({ gitData }) => {
  const [selectedBranch, setSelectedBranch] = useState('all');
  
  if (!gitData || !gitData.commits || gitData.commits.length === 0) {
    return (
      <Card className="h-96">
        <CardContent className="p-6 h-full"> 
          <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <GitBranch className="h-16 w-16 text-gray-400 mx-auto"/>
              <p className="text-lg text-gray-600">No commits found</p>
              <p className="text-sm text-gray-500">Upload a repository with commit history</p>
            </div>
          </div>
        </CardContent>  
      </Card>
    );
  }

  const filteredCommits = useMemo(() => {
    if (selectedBranch === 'all') {
      return gitData.commits;
    }
    return gitData.commits.filter(commit => 
      commit.branches && commit.branches.includes(selectedBranch)
    );
  }, [gitData.commits, selectedBranch]);

  return (
    <div className="space-y-6">
      {/* Branch Filter */}
      <BranchFilter 
        branches={gitData.branches} 
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
      />
      
      {/* Timeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitCommit className="h-5 w-5" />
            <span>Commit Timeline</span>
            <Badge variant="secondary">{filteredCommits.length} commits</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InteractiveCommitTimeline commits={filteredCommits} />
        </CardContent>
      </Card>

      {/* Commit Details */}
      <CommitList commits={filteredCommits.slice(-10)} />
    </div>
  );
};

// Branch Filter Component
const BranchFilter = ({ branches, selectedBranch, onBranchChange }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-700">Filter by Branch</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedBranch === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onBranchChange('all')}
          >
            All Branches
          </Button>
          {branches && branches.map((branch) => (
            <Button
              key={branch.name}
              variant={selectedBranch === branch.name ? 'default' : 'outline'}
              size="sm"
              onClick={() => onBranchChange(branch.name)}
              className="flex items-center space-x-1"
            >
              <GitBranch className="h-3 w-3" />
              <span>{branch.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// SVG Timeline Component
const CommitTimeline = ({ commits }) => {
  if (commits.length === 0) {
    return (
      <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No commits to display</p>
      </div>
    );
  }

  // Sort commits by date
  const sortedCommits = [...commits].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // SVG dimensions
  const width = 800;
  const height = 250;
  const margin = { top: 40, right: 40, bottom: 60, left: 40 };
  const timelineWidth = width - margin.left - margin.right;
  const timelineHeight = height - margin.top - margin.bottom;
  
  // Calculate positions for commits - handle single commit case
  const commitPositions = sortedCommits.map((commit, index) => {
    let x;
    if (sortedCommits.length === 1) {
      // Center single commit
      x = margin.left + timelineWidth / 2;
    } else {
      // Distribute multiple commits evenly
      x = margin.left + (index / (sortedCommits.length - 1)) * timelineWidth;
    }
    
    const y = margin.top + timelineHeight / 2;
    return { ...commit, x, y };
  });

  // Get branch colors
  const branchColors = getBranchColors(commits);

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="border rounded-lg bg-white">
        {/* Main timeline line */}
        <line
          x1={margin.left}
          y1={margin.top + timelineHeight / 2}
          x2={width - margin.right}
          y2={margin.top + timelineHeight / 2}
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        
        {/* Commit dots and connections */}
        {commitPositions.map((commit, index) => {
          const color = getCommitColor(commit, branchColors);
          
          return (
            <g key={commit.hash || index}>
              {/* Commit dot */}
              <circle
                cx={commit.x}
                cy={commit.y}
                r="6"
                fill={color}
                stroke="white"
                strokeWidth="2"
                className="hover:r-8 transition-all cursor-pointer"
                title={`${commit.shortHash}: ${commit.message}`}
              />
              
              {/* Commit hash label */}
              <text
                x={commit.x}
                y={commit.y - 15}
                textAnchor="middle"
                className="text-xs font-mono fill-gray-600"
              >
                {commit.shortHash || 'unknown'}
              </text>
              
              {/* Date label */}
              <text
                x={commit.x}
                y={commit.y + 25}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {formatDate(commit.date)}
              </text>
              
              {/* Timestamp label */}
              <text
                x={commit.x}
                y={commit.y + 40}
                textAnchor="middle"
                className="text-xs fill-gray-400"
              >
                {formatTime(commit.date)}
              </text>
            </g>
          );
        })}
        
        {/* Branch indicators */}
        <g>
          {Object.entries(branchColors).map(([branchName, color], index) => (
            <g key={branchName}>
              <circle
                cx={20}
                cy={20 + index * 20}
                r="4"
                fill={color}
              />
              <text
                x={30}
                y={25 + index * 20}
                className="text-xs fill-gray-700"
              >
                {branchName}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

// Commit List Component
const CommitList = ({ commits }) => {
  const recentCommits = [...commits].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Recent Commits</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentCommits.map((commit, index) => (
            <CommitCard key={commit.hash || index} commit={commit} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Individual Commit Card
const CommitCard = ({ commit }) => {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between space-x-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant="outline" className="font-mono text-xs">
              {commit.shortHash || 'unknown'}
            </Badge>
            {commit.branches && commit.branches.map((branch, index) => (
              <Badge key={`${branch}-${index}`} variant="secondary" className="text-xs">
                {branch}
              </Badge>
            ))}
          </div>
          
          <p className="font-medium text-gray-900 mb-1">
            {commit.message || 'No commit message'}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{commit.author || 'Unknown'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(commit.date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(commit.date)}</span>
            </div>
            {commit.parents && commit.parents.length > 1 && (
              <Badge variant="outline" className="text-xs">
                Merge
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility Functions
const getBranchColors = (commits) => {
  const branches = new Set();
  commits.forEach(commit => {
    if (commit.branches) {
      commit.branches.forEach(branch => branches.add(branch));
    }
  });
  
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
  ];
  
  const branchColors = {};
  Array.from(branches).forEach((branch, index) => {
    branchColors[branch] = colors[index % colors.length];
  });
  
  return branchColors;
};

const getCommitColor = (commit, branchColors) => {
  if (commit.branches && commit.branches.length > 0) {
    return branchColors[commit.branches[0]] || '#6b7280';
  }
  return '#6b7280'; // gray fallback
};

const formatDate = (date) => {
  if (!date) return 'Unknown';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (date) => {
  if (!date) return 'Unknown';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Time';
  
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Demo component that only uses gitData prop
export const GitVisualizationDemo = ({ gitData }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Git Timeline Visualization</h2>
        <p className="text-gray-600">Interactive visualization of your repository's commit history</p>
      </div>
      
      <GitTimeline gitData={gitData} />
    </div>
  );
};

export default GitVisualizationDemo;