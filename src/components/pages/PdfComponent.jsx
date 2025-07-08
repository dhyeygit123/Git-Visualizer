import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Loader2, GitBranch, GitCommit, Users, TrendingUp, Calendar, CheckCircle } from "lucide-react";

const PDFExportComponent = ({ analytics, gitData }) => {
  const [isGenerating, setIsGenerating] = useState(false);

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
    if (recentActivity >= 20) return 'High';
    if (recentActivity >= 5) return 'Medium';
    return 'Low';
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

  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const repositoryAge = (() => {
      if (analytics.commits.length > 0) {
        const dates = analytics.commits.map(c => new Date(c.date || c.authorDate)).filter(d => !isNaN(d));
        if (dates.length > 0) {
          const earliestDate = new Date(Math.min(...dates));
          const days = Math.ceil((new Date() - earliestDate) / (24 * 60 * 60 * 1000));
          return days + ' days';
        }
      }
      return '—';
    })();

    const branchTypes = {
      main: analytics.branches.filter(b => classifyBranch(b.name) === 'main').length,
      feature: analytics.branches.filter(b => classifyBranch(b.name) === 'feature').length,
      release: analytics.branches.filter(b => classifyBranch(b.name) === 'release').length,
      hotfix: analytics.branches.filter(b => classifyBranch(b.name) === 'hotfix').length,
      develop: analytics.branches.filter(b => classifyBranch(b.name) === 'develop').length,
      other: analytics.branches.filter(b => classifyBranch(b.name) === 'other').length
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Git Workflow Analytics Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
        }
        .header h1 {
            color: #111827;
            font-size: 28px;
            margin: 0 0 10px 0;
        }
        .header p {
            color: #6b7280;
            font-size: 16px;
            margin: 0;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .metric-card h3 {
            margin: 0 0 5px 0;
            font-size: 14px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .metric-value {
            font-size: 32px;
            font-weight: bold;
            margin: 0 0 5px 0;
        }
        .metric-description {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
        }
        .commits { color: #2563eb; }
        .branches { color: #059669; }
        .contributors { color: #7c3aed; }
        .activity { color: #ea580c; }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #111827;
            font-size: 20px;
            margin: 0 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        .patterns-list {
            display: grid;
            gap: 12px;
        }
        .pattern-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: #f9fafb;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }
        .pattern-label {
            font-weight: 500;
            color: #374151;
        }
        .badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        .badge.detected {
            background: #dcfce7;
            color: #166534;
        }
        .badge.not-detected {
            background: #f3f4f6;
            color: #6b7280;
        }
        .overview-grid {
            display: grid;
            gap: 12px;
        }
        .overview-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: #f9fafb;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }
        .contributors-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .contributors-table th,
        .contributors-table td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .contributors-table th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
        }
        .branch-breakdown {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 15px;
        }
        .branch-type {
            text-align: center;
            padding: 15px;
            background: #f9fafb;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }
        .branch-type-count {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
            margin: 0 0 5px 0;
        }
        .branch-type-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .activity-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        .activity-high { background: #dcfce7; color: #166534; }
        .activity-medium { background: #fef3c7; color: #92400e; }
        .activity-low { background: #fee2e2; color: #991b1b; }
        @media print {
            body { margin: 0; padding: 15px; }
            .metrics-grid { grid-template-columns: repeat(2, 1fr); }
            .branch-breakdown { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Git Workflow Analytics Report</h1>
        <p>Generated on ${currentDate}</p>
    </div>

    <div class="metrics-grid">
        <div class="metric-card">
            <h3>Total Commits</h3>
            <div class="metric-value commits">${analytics.metrics.totalCommits || 0}</div>
            <p class="metric-description">
                ${analytics.metrics.avgCommitsPerDay > 0 ? `~${analytics.metrics.avgCommitsPerDay} per day avg` : 'No commits data'}
            </p>
        </div>
        
        <div class="metric-card">
            <h3>Total Branches</h3>
            <div class="metric-value branches">${analytics.metrics.totalBranches || 0}</div>
            <p class="metric-description">
                ${branchTypes.feature} feature branches
            </p>
        </div>
        
        <div class="metric-card">
            <h3>Contributors</h3>
            <div class="metric-value contributors">${analytics.metrics.activeContributors || 0}</div>
            <p class="metric-description">
                ${analytics.contributors.length > 0 ? `${analytics.contributors[0]?.name?.split(' ')[0] || 'Unknown'} is most active` : 'No contributors data'}
            </p>
        </div>
        
        <div class="metric-card">
            <h3>Recent Activity</h3>
            <div class="metric-value activity">${analytics.metrics.recentActivity || 0}</div>
            <p class="metric-description">
                <span class="activity-badge activity-${getActivityLevel(analytics.metrics.recentActivity).toLowerCase()}">${getActivityLevel(analytics.metrics.recentActivity)}</span>
                last 30 days
            </p>
        </div>
    </div>

    <div class="section">
        <h2>Workflow Patterns</h2>
        <div class="patterns-list">
            <div class="pattern-item">
                <span class="pattern-label">GitFlow Strategy</span>
                <span class="badge ${analytics.patterns.hasGitFlow ? 'detected' : 'not-detected'}">
                    ${analytics.patterns.hasGitFlow ? 'Detected' : 'Not Detected'}
                </span>
            </div>
            <div class="pattern-item">
                <span class="pattern-label">Feature Branches</span>
                <span class="badge ${analytics.patterns.hasFeatureBranches ? 'detected' : 'not-detected'}">
                    ${analytics.patterns.hasFeatureBranches ? 'Detected' : 'Not Detected'}
                </span>
            </div>
            <div class="pattern-item">
                <span class="pattern-label">Release Branches</span>
                <span class="badge ${analytics.patterns.hasReleaseBranches ? 'detected' : 'not-detected'}">
                    ${analytics.patterns.hasReleaseBranches ? 'Detected' : 'Not Detected'}
                </span>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Branch Breakdown</h2>
        <div class="branch-breakdown">
            <div class="branch-type">
                <div class="branch-type-count">${branchTypes.main}</div>
                <div class="branch-type-label">Main</div>
            </div>
            <div class="branch-type">
                <div class="branch-type-count">${branchTypes.feature}</div>
                <div class="branch-type-label">Feature</div>
            </div>
            <div class="branch-type">
                <div class="branch-type-count">${branchTypes.release}</div>
                <div class="branch-type-label">Release</div>
            </div>
            <div class="branch-type">
                <div class="branch-type-count">${branchTypes.hotfix}</div>
                <div class="branch-type-label">Hotfix</div>
            </div>
            <div class="branch-type">
                <div class="branch-type-count">${branchTypes.develop}</div>
                <div class="branch-type-label">Develop</div>
            </div>
            <div class="branch-type">
                <div class="branch-type-count">${branchTypes.other}</div>
                <div class="branch-type-label">Other</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Repository Overview</h2>
        <div class="overview-grid">
            <div class="overview-item">
                <span class="pattern-label">Most Active Contributor</span>
                <span>${analytics.contributors.length > 0 ? analytics.contributors[0].name.split(' ')[0] : '—'}</span>
            </div>
            <div class="overview-item">
                <span class="pattern-label">Latest Commit</span>
                <span>${analytics.commits.length > 0 ? formatDate(analytics.commits[0].date || analytics.commits[0].authorDate) : '—'}</span>
            </div>
            <div class="overview-item">
                <span class="pattern-label">Repository Age</span>
                <span>${repositoryAge}</span>
            </div>
        </div>
    </div>

    ${analytics.contributors.length > 0 ? `
    <div class="section">
        <h2>Top Contributors</h2>
        <table class="contributors-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Commits</th>
                    <th>First Commit</th>
                    <th>Last Commit</th>
                </tr>
            </thead>
            <tbody>
                ${analytics.contributors.slice(0, 10).map(contributor => `
                    <tr>
                        <td>${contributor.name}</td>
                        <td>${contributor.commits}</td>
                        <td>${formatDate(contributor.firstCommit)}</td>
                        <td>${formatDate(contributor.lastCommit)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="footer">
        <p>Generated by Git Workflow Visualizer • ${currentDate}</p>
    </div>
</body>
</html>
    `;
  };

  const handleExportPDF = async () => {
    if (!gitData || !analytics) {
      alert('No data available to export');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create the HTML content
      const htmlContent = generatePDFContent();
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          setIsGenerating(false);
        }, 500);
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report');
      setIsGenerating(false);
    }
  };

  if (!gitData) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Export Report</span>
          </CardTitle>
          <CardDescription>
            Generate a comprehensive PDF report of your workflow analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Upload a repository to generate a detailed analytics report
            </p>
            <Button disabled variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Export Report</span>
        </CardTitle>
        <CardDescription>
          Generate a comprehensive PDF report of your workflow analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Report includes:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Key metrics overview</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Workflow patterns analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Branch breakdown</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Top contributors</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Current data:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Total commits:</span>
                  <span className="font-medium">{analytics.metrics.totalCommits || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total branches:</span>
                  <span className="font-medium">{analytics.metrics.totalBranches || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contributors:</span>
                  <span className="font-medium">{analytics.metrics.activeContributors || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recent activity:</span>
                  <span className="font-medium">{analytics.metrics.recentActivity || 0}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-end">
            <Button 
              onClick={handleExportPDF}
              disabled={isGenerating}
              className="min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF Report
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFExportComponent;