import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitBranch, GitCommit, User, Calendar, Hash, Clock, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

// Enhanced Interactive Timeline Component
export const InteractiveCommitTimeline = ({ commits }) => {
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [hoveredCommit, setHoveredCommit] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

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
  const baseWidth = 800;
  const baseHeight = 250;
  const width = baseWidth * zoomLevel;
  const height = baseHeight * zoomLevel;
  const margin = { top: 40, right: 40, bottom: 60, left: 40 };
  const timelineWidth = width - margin.left - margin.right;
  const timelineHeight = height - margin.top - margin.bottom;
  
  // Calculate positions for commits
  const commitPositions = sortedCommits.map((commit, index) => {
    let x;
    if (sortedCommits.length === 1) {
      x = margin.left + timelineWidth / 2;
    } else {
      x = margin.left + (index / (sortedCommits.length - 1)) * timelineWidth;
    }
    
    const y = margin.top + timelineHeight / 2;
    return { ...commit, x, y };
  });

  // Get branch colors
  const branchColors = getBranchColors(commits);

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedCommit(null);
  };

  // Pan controls
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'circle') return; // Don't pan when clicking commits
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Commit interactions
  const handleCommitClick = (commit) => {
    setSelectedCommit(selectedCommit?.hash === commit.hash ? null : commit);
  };

  const handleCommitHover = (commit, event) => {
    setHoveredCommit(commit);
    setShowTooltip(true);
    const rect = svgRef.current.getBoundingClientRect();
    setTooltipPosition({
      x: event.clientX - rect.left + 10,
      y: event.clientY - rect.top - 10
    });
  };

  const handleCommitLeave = () => {
    setHoveredCommit(null);
    setShowTooltip(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedCommit) return;
      
      const currentIndex = commitPositions.findIndex(c => c.hash === selectedCommit.hash);
      let newIndex;
      
      switch (e.key) {
        case 'ArrowLeft':
          newIndex = Math.max(0, currentIndex - 1);
          setSelectedCommit(commitPositions[newIndex]);
          e.preventDefault();
          break;
        case 'ArrowRight':
          newIndex = Math.min(commitPositions.length - 1, currentIndex + 1);
          setSelectedCommit(commitPositions[newIndex]);
          e.preventDefault();
          break;
        case 'Escape':
          setSelectedCommit(null);
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCommit, commitPositions]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleResetView}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Badge variant="secondary" className="text-xs">
            Zoom: {Math.round(zoomLevel * 100)}%
          </Badge>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <div>Click commits to select • Drag to pan</div>
          <div>Use ← → arrows to navigate • ESC to deselect</div>
        </div>
      </div>

      {/* Interactive Timeline */}
      <div className="relative border rounded-lg bg-white overflow-hidden" style={{ height: '300px' }}>
        <div 
          className="w-full h-full overflow-auto cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg 
            ref={svgRef}
            width={width} 
            height={height}
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease'
            }}
            className="select-none"
          >
            {/* Main timeline line */}
            <line
              x1={margin.left}
              y1={margin.top + timelineHeight / 2}
              x2={width - margin.right}
              y2={margin.top + timelineHeight / 2}
              stroke="#e5e7eb"
              strokeWidth={2 * zoomLevel}
            />
            
            {/* Connection lines between commits */}
            {commitPositions.map((commit, index) => {
              if (index === 0) return null;
              const prevCommit = commitPositions[index - 1];
              
              return (
                <line
                  key={`connection-${index}`}
                  x1={prevCommit.x}
                  y1={prevCommit.y}
                  x2={commit.x}
                  y2={commit.y}
                  stroke="#d1d5db"
                  strokeWidth={1 * zoomLevel}
                  strokeDasharray={selectedCommit ? "none" : "5,5"}
                  className="transition-all duration-200"
                />
              );
            })}
            
            {/* Commit dots and labels */}
            {commitPositions.map((commit, index) => {
              const color = getCommitColor(commit, branchColors);
              const isSelected = selectedCommit?.hash === commit.hash;
              const isHovered = hoveredCommit?.hash === commit.hash;
              const radius = (isSelected ? 10 : isHovered ? 8 : 6) * zoomLevel;
              
              return (
                <g key={commit.hash || index}>
                  {/* Selection ring */}
                  {isSelected && (
                    <circle
                      cx={commit.x}
                      cy={commit.y}
                      r={radius + 4}
                      fill="none"
                      stroke={color}
                      strokeWidth={2 * zoomLevel}
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Commit dot */}
                  <circle
                    cx={commit.x}
                    cy={commit.y}
                    r={radius}
                    fill={color}
                    stroke="white"
                    strokeWidth={2 * zoomLevel}
                    className="cursor-pointer transition-all duration-200 hover:drop-shadow-lg"
                    onClick={() => handleCommitClick(commit)}
                    onMouseEnter={(e) => handleCommitHover(commit, e)}
                    onMouseLeave={handleCommitLeave}
                    style={{
                      filter: isSelected ? `brightness(1.2) drop-shadow(0 0 8px ${color}40)` : 
                              isHovered ? 'brightness(1.1)' : 'none'
                    }}
                  />
                  
                  {/* Commit hash label */}
                  <text
                    x={commit.x}
                    y={commit.y - (15 * zoomLevel)}
                    textAnchor="middle"
                    className="text-xs font-mono fill-gray-600 pointer-events-none select-none"
                    fontSize={10 * zoomLevel}
                  >
                    {commit.shortHash || 'unknown'}
                  </text>
                  
                  {/* Date label */}
                  <text
                    x={commit.x}
                    y={commit.y + (25 * zoomLevel)}
                    textAnchor="middle"
                    className="text-xs fill-gray-500 pointer-events-none select-none"
                    fontSize={8 * zoomLevel}
                  >
                    {formatDate(commit.date)}
                  </text>
                  
                  {/* Timestamp label */}
                  <text
                    x={commit.x}
                    y={commit.y + (40 * zoomLevel)}
                    textAnchor="middle"
                    className="text-xs fill-gray-400 pointer-events-none select-none"
                    fontSize={8 * zoomLevel}
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
                    cx={20 * zoomLevel}
                    cy={(20 + index * 20) * zoomLevel}
                    r={4 * zoomLevel}
                    fill={color}
                  />
                  <text
                    x={30 * zoomLevel}
                    y={(25 + index * 20) * zoomLevel}
                    className="text-xs fill-gray-700 pointer-events-none select-none"
                    fontSize={10 * zoomLevel}
                  >
                    {branchName}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
        
        {/* Tooltip */}
        {showTooltip && hoveredCommit && (
          <div 
            className="absolute z-10 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-lg max-w-xs"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: 'translateY(-100%)'
            }}
          >
            <div className="font-mono font-bold">{hoveredCommit.shortHash}</div>
            <div className="mt-1">{hoveredCommit.message}</div>
            <div className="mt-1 text-gray-300">
              by {hoveredCommit.author} • {formatDate(hoveredCommit.date)}
            </div>
            {hoveredCommit.branches && (
              <div className="mt-1">
                {hoveredCommit.branches.map((branch, idx) => (
                  <span key={idx} className="inline-block bg-gray-700 px-1 rounded text-xs mr-1">
                    {branch}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Commit Details */}
      {selectedCommit && (
        <CommitDetailPanel 
          commit={selectedCommit} 
          onClose={() => setSelectedCommit(null)}
        />
      )}
    </div>
  );
};

// Commit Detail Panel Component
const CommitDetailPanel = ({ commit, onClose }) => {
  return (
    <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <GitCommit className="h-5 w-5" />
            <span>Selected Commit</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Hash</label>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="font-mono">
                  {commit.shortHash}
                </Badge>
                <Badge variant="secondary" className="font-mono text-xs">
                  {commit.hash}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Branches</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {commit.branches?.map((branch, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <GitBranch className="h-3 w-3 mr-1" />
                    {branch}
                  </Badge>
                )) || <span className="text-sm text-gray-500">No branches</span>}
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Message</label>
            <p className="mt-1 text-gray-900 bg-white p-3 rounded border">
              {commit.message || 'No commit message'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Author</label>
              <div className="flex items-center space-x-2 mt-1">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-900">{commit.author || 'Unknown'}</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Date & Time</label>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(commit.date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(commit.date)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {commit.parents && commit.parents.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">Parents</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {commit.parents.map((parent, index) => (
                  <Badge key={index} variant="outline" className="font-mono text-xs">
                    {parent.substring(0, 7)}
                  </Badge>
                ))}
                {commit.parents.length > 1 && (
                  <Badge variant="outline" className="text-xs bg-yellow-100">
                    Merge Commit
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Utility functions (same as original)
const getBranchColors = (commits) => {
  const branches = new Set();
  commits.forEach(commit => {
    if (commit.branches) {
      commit.branches.forEach(branch => branches.add(branch));
    }
  });
  
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
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
  return '#6b7280';
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

export default InteractiveCommitTimeline;