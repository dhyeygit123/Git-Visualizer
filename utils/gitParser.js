// src/utils/gitParser.js
import JSZip from 'jszip';
import pako from 'pako'; // Add this dependency for zlib decompression

export class GitParser {
  constructor() {
    this.gitData = {
      commits: [],
      branches: [],
      HEAD: null,
      refs: {},
      tags: [],
      objects: new Map() // Store all parsed objects
    };
  }

  // Main parsing function
  async parseGitRepository(files) {
    // console.log('Starting Git repository parsing...');
    
    for (const file of files) {
      if (file.name.endsWith('.zip')) {
        await this.parseZipFile(file);
      }
    }
    
    // console.log('Parsed git data:', this.gitData);
    return this.gitData;
  }

  // Parse ZIP file and extract .git folder contents
  async parseZipFile(zipFile) {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipFile);
      
      // Find .git folder in the zip
      const gitFiles = {};
      
      zipContent.forEach((relativePath, file) => {
        if (relativePath.includes('.git/') && !file.dir) {
          // Remove the project folder prefix to get clean .git paths
          const gitPath = relativePath.substring(relativePath.indexOf('.git/'));
          gitFiles[gitPath] = file;
        }
      });

      if (Object.keys(gitFiles).length === 0) {
        throw new Error('No .git folder found in the uploaded file');
      }

      // Parse git files
      await this.parseGitFiles(gitFiles);
      
    } catch (error) {
      console.error('Error parsing ZIP file:', error);
      throw new Error(`Failed to parse repository: ${error.message}`);
    }
  }

  // Parse individual git files
  async parseGitFiles(gitFiles) {
    // Parse HEAD first to know current branch
    if (gitFiles['.git/HEAD']) {
      this.gitData.HEAD = await this.parseHEAD(gitFiles['.git/HEAD']);
    }

    // Parse refs (branches and tags)
    await this.parseRefs(gitFiles);

    // Parse all objects first
    await this.parseAllObjects(gitFiles);

    // Then build commit history from real objects
    this.buildRealCommitHistory();
  }

  // Parse HEAD file to get current branch
  async parseHEAD(headFile) {
    try {
      const content = await headFile.async('text');
      const trimmed = content.trim();
      
      if (trimmed.startsWith('ref: refs/heads/')) {
        return {
          type: 'branch',
          name: trimmed.replace('ref: refs/heads/', ''),
          ref: trimmed
        };
      } else if (trimmed.match(/^[0-9a-f]{40}$/)) {
        return {
          type: 'commit',
          hash: trimmed
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing HEAD:', error);
      return null;
    }
  }

  // Parse refs directory for branches and tags
  async parseRefs(gitFiles) {
    const branches = [];
    const tags = [];

    for (const [path, file] of Object.entries(gitFiles)) {
      if (path.startsWith('.git/refs/heads/')) {
        const branchName = path.replace('.git/refs/heads/', '');
        const hash = (await file.async('text')).trim();
        branches.push({
          name: branchName,
          hash: hash,
          type: 'branch'
        });
      } else if (path.startsWith('.git/refs/tags/')) {
        const tagName = path.replace('.git/refs/tags/', '');
        const hash = (await file.async('text')).trim();
        tags.push({
          name: tagName,
          hash: hash,
          type: 'tag'
        });
      }
    }

    this.gitData.branches = branches;
    this.gitData.tags = tags;
  }

  // Parse all objects from the objects directory
  async parseAllObjects(gitFiles) {
    const objectFiles = Object.keys(gitFiles).filter(path => 
      path.startsWith('.git/objects/') && 
      path.length === '.git/objects/xx/'.length + 38 // 2 chars + 38 chars = 40 char hash
    );

    for (const objectPath of objectFiles) {
      try {
        const file = gitFiles[objectPath];
        const pathParts = objectPath.split('/');
        const folder = pathParts[pathParts.length - 2];
        const filename = pathParts[pathParts.length - 1];
        const hash = folder + filename;

        const gitObject = await this.parseGitObject(hash, file);
        if (gitObject) {
          this.gitData.objects.set(hash, gitObject);
        }
      } catch (error) {
        console.error(`Error parsing git object ${objectPath}:`, error);
      }
    }
  }

  // Parse a single Git object
  async parseGitObject(hash, file) {
    try {
      // Get the compressed data
      const compressedData = await file.async('uint8array');
      
      // Decompress using pako (zlib)
      const decompressed = pako.inflate(compressedData);
      
      // Convert to string for parsing
      const content = new TextDecoder('utf-8').decode(decompressed);
      
      // Parse the object header
      const nullIndex = content.indexOf('\0');
      if (nullIndex === -1) {
        throw new Error('Invalid git object format');
      }
      
      const header = content.substring(0, nullIndex);
      const body = content.substring(nullIndex + 1);
      
      const [type, size] = header.split(' ');
      
      switch (type) {
        case 'commit':
          return this.parseCommitObject(hash, body);
        case 'tree':
          return this.parseTreeObject(hash, body);
        case 'blob':
          return this.parseBlobObject(hash, body);
        case 'tag':
          return this.parseTagObject(hash, body);
        default:
          console.warn(`Unknown object type: ${type}`);
          return null;
      }
    } catch (error) {
      console.error(`Error parsing git object ${hash}:`, error);
      return null;
    }
  }

  // Parse commit object
  parseCommitObject(hash, content) {
    const lines = content.split('\n');
    const commit = {
      hash: hash,
      shortHash: hash.substring(0, 7),
      type: 'commit',
      tree: null,
      parents: [],
      author: null,
      authorEmail: null,
      authorDate: null,
      committer: null,
      committerEmail: null,
      committerDate: null,
      message: '',
      branches: []
    };

    let messageStart = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line === '') {
        messageStart = i + 1;
        break;
      }
      
      if (line.startsWith('tree ')) {
        commit.tree = line.substring(5);
      } else if (line.startsWith('parent ')) {
        commit.parents.push(line.substring(7));
      } else if (line.startsWith('author ')) {
        const authorMatch = line.match(/^author (.+) <(.+)> (\d+) ([\+\-]\d{4})$/);
        if (authorMatch) {
          commit.author = authorMatch[1];
          commit.authorEmail = authorMatch[2];
          commit.authorDate = new Date(parseInt(authorMatch[3]) * 1000);
        }
      } else if (line.startsWith('committer ')) {
        const committerMatch = line.match(/^committer (.+) <(.+)> (\d+) ([\+\-]\d{4})$/);
        if (committerMatch) {
          commit.committer = committerMatch[1];
          commit.committerEmail = committerMatch[2];
          commit.committerDate = new Date(parseInt(committerMatch[3]) * 1000);
        }
      }
    }
    
    if (messageStart !== -1) {
      commit.message = lines.slice(messageStart).join('\n').trim();
    }
    
    // Use author info as fallback for display
    commit.email = commit.authorEmail || commit.committerEmail;
    commit.date = commit.authorDate || commit.committerDate;
    
    return commit;
  }

  // Parse tree object
  parseTreeObject(hash, content) {
    const tree = {
      hash: hash,
      shortHash: hash.substring(0, 7),
      type: 'tree',
      entries: []
    };

    // Tree objects contain binary data, so we need to parse carefully
    const buffer = new TextEncoder().encode(content);
    let offset = 0;
    
    while (offset < buffer.length) {
      // Find the space separator
      let spaceIndex = offset;
      while (spaceIndex < buffer.length && buffer[spaceIndex] !== 32) {
        spaceIndex++;
      }
      
      if (spaceIndex >= buffer.length) break;
      
      const mode = new TextDecoder().decode(buffer.slice(offset, spaceIndex));
      offset = spaceIndex + 1;
      
      // Find the null separator
      let nullIndex = offset;
      while (nullIndex < buffer.length && buffer[nullIndex] !== 0) {
        nullIndex++;
      }
      
      if (nullIndex >= buffer.length) break;
      
      const name = new TextDecoder().decode(buffer.slice(offset, nullIndex));
      offset = nullIndex + 1;
      
      // Next 20 bytes are the SHA-1 hash
      if (offset + 20 > buffer.length) break;
      
      const hashBytes = buffer.slice(offset, offset + 20);
      const entryHash = Array.from(hashBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      offset += 20;
      
      tree.entries.push({
        mode: mode,
        name: name,
        hash: entryHash,
        type: mode.startsWith('100') ? 'blob' : 'tree'
      });
    }
    
    return tree;
  }

  // Parse blob object
  parseBlobObject(hash, content) {
    return {
      hash: hash,
      shortHash: hash.substring(0, 7),
      type: 'blob',
      content: content,
      size: content.length
    };
  }

  // Parse tag object
  parseTagObject(hash, content) {
    const lines = content.split('\n');
    const tag = {
      hash: hash,
      shortHash: hash.substring(0, 7),
      type: 'tag',
      object: null,
      objectType: null,
      tagName: null,
      tagger: null,
      taggerEmail: null,
      taggerDate: null,
      message: ''
    };

    let messageStart = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line === '') {
        messageStart = i + 1;
        break;
      }
      
      if (line.startsWith('object ')) {
        tag.object = line.substring(7);
      } else if (line.startsWith('type ')) {
        tag.objectType = line.substring(5);
      } else if (line.startsWith('tag ')) {
        tag.tagName = line.substring(4);
      } else if (line.startsWith('tagger ')) {
        const taggerMatch = line.match(/^tagger (.+) <(.+)> (\d+) ([\+\-]\d{4})$/);
        if (taggerMatch) {
          tag.tagger = taggerMatch[1];
          tag.taggerEmail = taggerMatch[2];
          tag.taggerDate = new Date(parseInt(taggerMatch[3]) * 1000);
        }
      }
    }
    
    if (messageStart !== -1) {
      tag.message = lines.slice(messageStart).join('\n').trim();
    }
    
    return tag;
  }

  // Build real commit history from parsed objects
  buildRealCommitHistory() {
    // Get all commit objects
    const commits = Array.from(this.gitData.objects.values())
      .filter(obj => obj.type === 'commit');
    
    // Sort commits by date
    commits.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Assign commits to branches by following the commit graph
    for (const branch of this.gitData.branches) {
      const branchCommits = this.getCommitsForBranch(branch.hash);
      branchCommits.forEach(commit => {
        if (!commit.branches.includes(branch.name)) {
          commit.branches.push(branch.name);
        }
      });
    }
    
    this.gitData.commits = commits;
  }

  // Get commits for a specific branch by following the parent chain
  getCommitsForBranch(startHash) {
    const commits = [];
    const visited = new Set();
    const toVisit = [startHash];
    
    while (toVisit.length > 0) {
      const hash = toVisit.pop();
      
      if (visited.has(hash)) continue;
      visited.add(hash);
      
      const obj = this.gitData.objects.get(hash);
      if (obj && obj.type === 'commit') {
        commits.push(obj);
        // Add parents to visit
        obj.parents.forEach(parentHash => {
          if (!visited.has(parentHash)) {
            toVisit.push(parentHash);
          }
        });
      }
    }
    
    return commits;
  }

  // Get parsed data
  getGitData() {
    return this.gitData;
  }

  // Get commit history for a specific branch
  getCommitHistory(branchName = null) {
    if (!branchName) {
      return this.gitData.commits;
    }
    
    return this.gitData.commits.filter(commit => 
      commit.branches.includes(branchName)
    );
  }

  // Get all branches
  getBranches() {
    return this.gitData.branches;
  }

  // Get repository statistics
  getStats() {
    const commits = this.gitData.commits;
    return {
      totalCommits: commits.length,
      totalBranches: this.gitData.branches.length,
      totalTags: this.gitData.tags.length,
      authors: [...new Set(commits.map(c => c.author).filter(Boolean))],
      dateRange: {
        earliest: commits.length > 0 ? 
          new Date(Math.min(...commits.map(c => new Date(c.date)).filter(d => !isNaN(d)))) : null,
        latest: commits.length > 0 ? 
          new Date(Math.max(...commits.map(c => new Date(c.date)).filter(d => !isNaN(d)))) : null
      },
      objectCounts: {
        commits: Array.from(this.gitData.objects.values()).filter(obj => obj.type === 'commit').length,
        trees: Array.from(this.gitData.objects.values()).filter(obj => obj.type === 'tree').length,
        blobs: Array.from(this.gitData.objects.values()).filter(obj => obj.type === 'blob').length,
        tags: Array.from(this.gitData.objects.values()).filter(obj => obj.type === 'tag').length
      }
    };
  }

  // Get a specific object by hash
  getObject(hash) {
    return this.gitData.objects.get(hash);
  }

  // Get file content at a specific commit
  async getFileAtCommit(commitHash, filePath) {
    const commit = this.gitData.objects.get(commitHash);
    if (!commit || commit.type !== 'commit') {
      return null;
    }
    
    // This would require traversing the tree structure
    // Implementation depends on your specific needs
    const tree = this.gitData.objects.get(commit.tree);
    return this.findFileInTree(tree, filePath.split('/'));
  }

  // Helper to find a file in a tree structure
  findFileInTree(tree, pathParts) {
    if (!tree || tree.type !== 'tree' || pathParts.length === 0) {
      return null;
    }
    
    const [currentPart, ...remainingParts] = pathParts;
    const entry = tree.entries.find(e => e.name === currentPart);
    
    if (!entry) return null;
    
    if (remainingParts.length === 0) {
      // This is the file we're looking for
      return this.gitData.objects.get(entry.hash);
    } else {
      // Continue traversing
      const subtree = this.gitData.objects.get(entry.hash);
      return this.findFileInTree(subtree, remainingParts);
    }
  }
}