import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GitBranch, Upload, BarChart3, Settings, Home, FileText, Users, Calendar, GitCommit, TrendingUp } from "lucide-react";

const AnalyticsPage = ({ gitData }) => {
  const [analytics, setAnalytics] = useState({
    branches: [],
    commits: [],
    contributors: [],
    patterns: {
      hasGitFlow: false,
      hasFeatureBranches: false,
      hasReleaseBranches: false
    },
    metrics: {
      totalCommits: 0,
      totalBranches: 0,
      activeContributors: 0,
      avgCommitsPerDay: 0,
      recentActivity: 0
    }
  });

  // Parse Git data when available
  useEffect(() => {
    if (gitData) {
      parseGitData(gitData);
    }
  }, [gitData]);

  const parseGitData = (data) => {
    try {
      console.log('Parsing git data:', data);
      
      // Extract branches - gitData.branches is already an array
      const branches = data.branches || [];
      
      // Extract commits - gitData.commits is already an array of parsed commit objects
      const commits = data.commits || [];
      
      // Extract contributors from the parsed commits
      const contributors = extractContributors(commits);
      
      // Analyze patterns
      const patterns = analyzeWorkflowPatterns(branches, commits);
      
      // Calculate metrics
      const metrics = calculateMetrics(branches, commits, contributors);
      
      setAnalytics({
        branches,
        commits,
        contributors,
        patterns,
        metrics
      });
    } catch (error) {
      console.error('Error parsing Git data:', error);
    }
  };

  const extractContributors = (commits) => {
    const contributorMap = {};
    
    commits.forEach(commit => {
      const email = commit.authorEmail || commit.email;
      const name = commit.author;
      
      if (email && name) {
        if (!contributorMap[email]) {
          contributorMap[email] = {
            name,
            email,
            commits: 0,
            firstCommit: commit.date || commit.authorDate,
            lastCommit: commit.date || commit.authorDate
          };
        }
        
        contributorMap[email].commits++;
        const commitDate = new Date(commit.date || commit.authorDate);
        
        if (commitDate < new Date(contributorMap[email].firstCommit)) {
          contributorMap[email].firstCommit = commitDate;
        }
        if (commitDate > new Date(contributorMap[email].lastCommit)) {
          contributorMap[email].lastCommit = commitDate;
        }
      }
    });
    
    return Object.values(contributorMap).sort((a, b) => b.commits - a.commits);
  };

  const classifyBranch = (branchName) => {
    const name = branchName.toLowerCase();
    if (name === 'main' || name === 'master') return 'main';
    if (name.startsWith('feature/') || name.startsWith('feat/')) return 'feature';
    if (name.startsWith('release/') || name.startsWith('rel/')) return 'release';
    if (name.startsWith('hotfix/') || name.startsWith('fix/')) return 'hotfix';
    if (name.startsWith('develop') || name === 'dev') return 'develop';
    return 'other';
  };

  const analyzeWorkflowPatterns = (branches, commits) => {
    const branchNames = branches.map(b => b.name.toLowerCase());
    
    return {
      hasGitFlow: branchNames.includes('develop') && branchNames.some(name => name.startsWith('release/')),
      hasFeatureBranches: branchNames.some(name => name.startsWith('feature/') || name.startsWith('feat/')),
      hasReleaseBranches: branchNames.some(name => name.startsWith('release/') || name.startsWith('rel/'))
    };
  };

  const calculateMetrics = (branches, commits, contributors) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // Filter recent commits based on parsed date objects
    const recentCommits = commits.filter(c => {
      const commitDate = new Date(c.date || c.authorDate);
      return commitDate >= thirtyDaysAgo;
    });
    
    // Calculate days since first commit
    let daysSinceFirstCommit = 1;
    if (commits.length > 0) {
      const dates = commits.map(c => new Date(c.date || c.authorDate)).filter(d => !isNaN(d));
      if (dates.length > 0) {
        const earliestDate = new Date(Math.min(...dates));
        daysSinceFirstCommit = Math.max(1, (now - earliestDate) / (24 * 60 * 60 * 1000));
      }
    }
    
    return {
      totalCommits: commits.length,
      totalBranches: branches.length,
      activeContributors: contributors.length,
      avgCommitsPerDay: Math.round((commits.length / daysSinceFirstCommit) * 10) / 10,
      recentActivity: recentCommits.length
    };
  };

  const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getActivityLevel = (recentActivity) => {
    if (recentActivity >= 20) return { level: 'High', color: 'text-green-600', bg: 'bg-green-100' };
    if (recentActivity >= 5) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const activityLevel = getActivityLevel(analytics.metrics.recentActivity);

  return (
    <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Workflow Analytics</h2>
            <p className="text-gray-600">
              {gitData ? 'Insights and metrics about your Git repository' : 'Upload a repository to see analytics'}
            </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <GitCommit className="h-5 w-5 text-blue-600"/>
                <span className="text-lg">Total Commits</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {analytics.metrics.totalCommits || '—'}
              </div>
              <CardDescription>
                {analytics.metrics.avgCommitsPerDay > 0 && 
                  `~${analytics.metrics.avgCommitsPerDay} per day avg`
                }
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <GitBranch className="h-5 w-5 text-green-600"/>
                <span className="text-lg">Branches</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {analytics.metrics.totalBranches || '—'}
              </div>
              <CardDescription>
                {analytics.branches.length > 0 && 
                  `${analytics.branches.filter(b => classifyBranch(b.name) === 'feature').length} feature branches`
                }
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600"/>
                <span className="text-lg">Contributors</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {analytics.metrics.activeContributors || '—'}
              </div>
              <CardDescription>
                {analytics.contributors.length > 0 && 
                  `${analytics.contributors[0]?.name?.split(' ')[0] || 'Unknown'} is most active`
                }
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-600"/>
                <span className="text-lg">Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {analytics.metrics.recentActivity || '—'}
              </div>
              <CardDescription>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${activityLevel.bg} ${activityLevel.color}`}>
                  {activityLevel.level}
                </span>
                <span className="ml-2 text-gray-500">last 30 days</span>
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Patterns</CardTitle>
                <CardDescription>Detected branching strategies and patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">GitFlow Strategy</span>
                    <Badge variant={analytics.patterns.hasGitFlow ? "default" : "secondary"}>
                      {analytics.patterns.hasGitFlow ? "Detected" : "Not Detected"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Feature Branches</span>
                    <Badge variant={analytics.patterns.hasFeatureBranches ? "default" : "secondary"}>
                      {analytics.patterns.hasFeatureBranches ? "Detected" : "Not Detected"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Release Branches</span>
                    <Badge variant={analytics.patterns.hasReleaseBranches ? "default" : "secondary"}>
                      {analytics.patterns.hasReleaseBranches ? "Detected" : "Not Detected"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Repository Overview</CardTitle>
                <CardDescription>Key information about your repository</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Most Active Contributor</span>
                    <span className="text-sm font-bold">
                      {analytics.contributors.length > 0 ? 
                        analytics.contributors[0].name.split(' ')[0] : 
                        '—'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Latest Commit</span>
                    <span className="text-sm font-bold">
                      {analytics.commits.length > 0 ? 
                        formatDate(analytics.commits[0].date || analytics.commits[0].authorDate) : 
                        '—'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Repository Age</span>
                    <span className="text-sm font-bold">
                      {analytics.commits.length > 0 ? (() => {
                        const dates = analytics.commits.map(c => new Date(c.date || c.authorDate)).filter(d => !isNaN(d));
                        if (dates.length > 0) {
                          const earliestDate = new Date(Math.min(...dates));
                          const days = Math.ceil((new Date() - earliestDate) / (24 * 60 * 60 * 1000));
                          return days + ' days';
                        }
                        return '—';
                      })() : '—'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

        {!gitData && (
          <Card className="mt-6">
            <CardContent className="p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Repository Data</h3>
              <p className="text-gray-600 mb-4">
                Upload a Git repository to see detailed analytics and insights about your development workflow.
              </p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Repository
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  )
}

export default AnalyticsPage;