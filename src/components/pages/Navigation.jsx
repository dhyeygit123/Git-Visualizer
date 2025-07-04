import React from 'react'
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Upload, BarChart3, Settings, Home, CreditCard} from "lucide-react";

const Navigation = ({currentPage, onPageChange }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon : Home},
    { id: 'upload', label: 'Upload Repository', icon : Upload},
    { id: 'visualizer', label: 'Visualizer', icon : GitBranch},
    { id: 'analytics', label: 'Analytics', icon : BarChart3 },
    { id: 'settings', label: 'Settings', icon : Settings},
    { id: 'payments', label: 'Payments', icon : CreditCard}
  ];
  return (
    <div className="pt-4 bg-gray-50">
    <nav className="bg-white shadow-lg border border-gray-200 px-4 py-5 mx-15 rounded-3xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GitBranch className="h-8 w-8 text-blue-600"></GitBranch>
          <h1 className="text-3xl font-extrabold text-gray-900"> GitFlow Visualizer</h1>
          <Badge variant="secondary">v1.0.0</Badge>
        </div>
        <div className="flex items-center space-x-3">
          {navItems.map(({id, label, icon: Icon})=> (
            <Button
             key={id}
             variant={currentPage === id ? "default" : "ghost"}
             className="flex items-center rounded-full space-x-1"
             onClick={() => onPageChange(id)}
             >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
             </Button>
          ))}
          {/* <ThemeToggle/> */}
        </div>
      </div>
    </nav>
    </div>
  );
};

export default Navigation