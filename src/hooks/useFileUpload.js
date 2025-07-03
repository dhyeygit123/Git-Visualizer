// src/hooks/useFileUpload.js - UPDATED VERSION
import { useState, useCallback } from 'react';
import { GitParser } from '../../utils/gitParser';

export const useFileUpload = () => {
  const [uploadState, setUploadState] = useState({
    isDragging: false,
    isUploading: false,
    progress: 0,
    uploadedFiles: null,
    parsedGitData: null,
    error: null,
    success: false,
    parsingStep: '' // New: to show what we're currently parsing
  });

  const validateFiles = (files) => {
    const validExtensions = ['.zip', '.tar.gz', '.tar'];
    const maxSize = 100 * 1024 * 1024; // 100MB limit

    for (let file of files) {
      // Check file size
      if (file.size > maxSize) {
        throw new Error(`File "${file.name}" is too large. Maximum size is 100MB.`);
      }

      // Check if it's likely a git repository
      const hasValidExtension = validExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );
      
      if (!hasValidExtension && !file.name.includes('.git')) {
        throw new Error(`File "${file.name}" doesn't appear to be a git repository. Please upload a .zip file containing a .git folder.`);
      }
    }
    return true;
  };

  const processFiles = async (files) => {
    try {
      setUploadState(prev => ({ 
        ...prev, 
        isUploading: true, 
        error: null, 
        progress: 0,
        parsingStep: 'Validating files...'
      }));

      // Validate files
      validateFiles(files);
      
      // Step 1: File validation complete
      setUploadState(prev => ({ 
        ...prev, 
        progress: 20,
        parsingStep: 'Extracting repository...'
      }));
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Initialize Git Parser
      const gitParser = new GitParser();
      setUploadState(prev => ({ 
        ...prev, 
        progress: 40,
        parsingStep: 'Parsing Git data...'
      }));
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Parse the git repository
      const gitData = await gitParser.parseGitRepository(Array.from(files));
      
      setUploadState(prev => ({ 
        ...prev, 
        progress: 80,
        parsingStep: 'Building commit history...'
      }));
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Complete
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        uploadedFiles: Array.from(files),
        parsedGitData: gitData,
        success: true,
        progress: 100,
        parsingStep: 'Complete!'
      }));

      return { files: Array.from(files), gitData };

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: error.message,
        progress: 0,
        parsingStep: ''
      }));
      throw error;
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragging: false }));
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  }, []);

  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  }, []);

  const resetUpload = useCallback(() => {
    setUploadState({
      isDragging: false,
      isUploading: false,
      progress: 0,
      uploadedFiles: null,
      parsedGitData: null,
      error: null,
      success: false,
      parsingStep: ''
    });
  }, []);

  return {
    uploadState,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    resetUpload
  };
};