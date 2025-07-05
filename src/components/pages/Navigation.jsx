import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Upload, BarChart3, Settings, Home, CreditCard, Menu, X} from "lucide-react";

const Navigation = ({currentPage, onPageChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'home', label: 'Home', icon : Home},
    { id: 'upload', label: 'Upload', icon : Upload},
    { id: 'visualizer', label: 'Visualizer', icon : GitBranch},
    { id: 'analytics', label: 'Analytics', icon : BarChart3 },
    { id: 'settings', label: 'Settings', icon : Settings},
    { id: 'payments', label: 'Payments', icon : CreditCard}
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="pt-2 sm:pt-4 bg-gray-50">
      <nav className="bg-white shadow-lg border border-gray-200 px-3 sm:px-4 py-3 sm:py-5 mx-2 sm:mx-4 lg:mx-15 rounded-2xl sm:rounded-3xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <GitBranch className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-gray-900">
              <span className="hidden sm:inline">GitFlow Visualizer</span>
              <span className="sm:hidden">GitFlow</span>
            </h1>
            <Badge variant="secondary" className="text-xs sm:text-sm">v1.0.0</Badge>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
            {navItems.map(({id, label, icon: Icon}) => (
              <Button
                key={id}
                variant={currentPage === id ? "default" : "ghost"}
                className="flex items-center rounded-full space-x-1 px-3 py-2 text-sm"
                onClick={() => onPageChange(id)}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Button>
            ))}
          </div>

          {/* Tablet Navigation */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            {navItems.map(({id, label, icon: Icon}) => (
              <Button
                key={id}
                variant={currentPage === id ? "default" : "ghost"}
                className="flex items-center rounded-full p-2"
                onClick={() => onPageChange(id)}
                title={label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map(({id, label, icon: Icon}) => (
                <Button
                  key={id}
                  variant={currentPage === id ? "default" : "ghost"}
                  className="flex items-center justify-start space-x-2 p-3 w-full"
                  onClick={() => {
                    onPageChange(id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navigation