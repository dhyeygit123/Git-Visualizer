// src/components/GitHubUrlInput.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Github, Loader2, ExternalLink } from 'lucide-react';

const GitHubUrlInput = ({ onVisualize }) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateGitHubUrl = (url) => {
    // Basic GitHub URL validation
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/;
    return githubRegex.test(url.trim());
  };

  const extractRepoInfo = (url) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, '') // Remove .git extension if present
      };
    }
    return null;
  };

  const fetchGitHubRepoData = async (owner, repo) => {
    try {
      // Fetch repository information
      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!repoResponse.ok) {
        throw new Error(`Repository not found or not accessible (${repoResponse.status})`);
      }
      const repoData = await repoResponse.json();

      // Fetch commits
      const commitsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`);
      if (!commitsResponse.ok) {
        throw new Error(`Failed to fetch commits (${commitsResponse.status})`);
      }
      const commitsData = await commitsResponse.json();

      // Fetch branches
      const branchesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`);
      const branchesData = branchesResponse.ok ? await branchesResponse.json() : [];

      // Fetch contributors
      const contributorsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors`);
      const contributorsData = contributorsResponse.ok ? await contributorsResponse.json() : [];

      return {
        repository: repoData,
        commits: commitsData,
        branches: branchesData,
        contributors: contributorsData
      };
    } catch (error) {
      throw new Error(`Failed to fetch repository data: ${error.message}`);
    }
  };

  const transformGitHubDataToGitFormat = (githubData) => {
    const { repository, commits, branches, contributors } = githubData;
    
    // Transform commits to match your expected git data format
    const transformedCommits = commits.map(commit => ({
      hash: commit.sha,
      author: commit.commit.author.name,
      email: commit.commit.author.email,
      date: commit.commit.author.date,
      message: commit.commit.message,
      parents: commit.parents.map(p => p.sha)
    }));

    // Transform branches
    const transformedBranches = branches.map(branch => ({
      name: branch.name,
      commit: branch.commit.sha,
      protected: branch.protected || false
    }));

    // Create a git-like data structure
    return {
      repository: {
        name: repository.name,
        fullName: repository.full_name,
        description: repository.description,
        url: repository.html_url,
        defaultBranch: repository.default_branch,
        createdAt: repository.created_at,
        updatedAt: repository.updated_at,
        language: repository.language,
        stargazersCount: repository.stargazers_count,
        forksCount: repository.forks_count
      },
      commits: transformedCommits,
      branches: transformedBranches,
      contributors: contributors.map(contributor => ({
        login: contributor.login,
        contributions: contributor.contributions,
        avatarUrl: contributor.avatar_url,
        htmlUrl: contributor.html_url
      })),
      refs: {
        heads: branches.reduce((acc, branch) => {
          acc[branch.name] = branch.commit.sha;
          return acc;
        }, {})
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!githubUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!validateGitHubUrl(githubUrl)) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
      return;
    }

    const repoInfo = extractRepoInfo(githubUrl);
    if (!repoInfo) {
      setError('Could not extract repository information from URL');
      return;
    }

    setIsLoading(true);
    
    try {
      const githubData = await fetchGitHubRepoData(repoInfo.owner, repoInfo.repo);
      const transformedData = transformGitHubDataToGitFormat(githubData);
      
      // Call the visualization handler with the transformed data
      onVisualize([], transformedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setGithubUrl(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Github className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Import from GitHub</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="github-url" className="block text-sm font-medium text-gray-700 mb-2">
              Repository URL
            </label>
            <Input
              id="github-url"
              type="url"
              placeholder="https://github.com/owner/repository"
              value={githubUrl}
              onChange={handleInputChange}
              className="w-full"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter the URL of a public GitHub repository
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !githubUrl.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing Repository...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Import & Visualize
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This feature works with public repositories only. 
            For private repositories, please use the file upload option.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitHubUrlInput;