import {React, useState} from 'react'
import { GitBranch } from "lucide-react";
import AnalyticsPage from './components/pages/AnalyticsPage';
import HomePage from './components/pages/HomePage';
import Navigation from './components/pages/Navigation'
import SettingsPage from './components/pages/SettingsPage';
import UploadPage from './components/pages/UploadPage'
import VisualizerPage from './components/pages/VisualizerPage'
import PaymentPage from './components/pages/Payments';

const App = () => {
  // State to track which page is currently active
  const [gitData, setGitData] = useState(null); 
  const [currentPage, setCurrentPage] = useState('home');
  // Function that renders the appropriate page component
  const renderPage = () => {
    console.log(gitData);
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={setCurrentPage} />;
      case 'upload':
        return <UploadPage onPageChange={setCurrentPage} onSetGitData={handleSetGitData}/>;
      case 'visualizer':
        return <VisualizerPage onPageChange={setCurrentPage} gitData={gitData}/>;
      case 'analytics':
        return <AnalyticsPage gitData={gitData} />;
      case 'settings':
        return <SettingsPage />;
      case 'donate':
        return <PaymentPage onPageChange={setCurrentPage}/>
      default:
        return <HomePage onPageChange={setCurrentPage} />;
    }
  };


  const handleSetGitData = (data) => { // Add this function
    setGitData(data);
    console.log('Git data stored in app:', data);
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation bar - always visible */}
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      {/* Main content area - changes based on currentPage */}
      <main className="py-8">
        {renderPage()}
      </main>
      
      {/* Footer - always visible */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GitBranch className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">GitFlow Visualizer</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Making Git workflows beautiful and understandable
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <span>Built with React & shadcn/ui</span>
            <span>•</span>
            <span>Built By: Dhyey Patel</span>
            <span>•</span>
            <span>dhyey.c.patel@gmail.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;