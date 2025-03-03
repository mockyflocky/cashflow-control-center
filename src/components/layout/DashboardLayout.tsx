
import React, { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, isLoading, logout, isAdmin, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const mobileDefault = isMobile ? false : true;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(mobileDefault);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    {
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      href: "/",
      active: location.pathname === "/"
    },
    ...(!isAdmin ? [] : [
      {
        label: "Admin",
        icon: <PieChart className="h-5 w-5" />,
        href: "/admin",
        active: location.pathname === "/admin"
      }
    ])
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="fixed z-50 top-4 left-4 lg:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="relative text-primary rounded-full shadow-elevation-medium bg-white/80 backdrop-blur-sm"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 lg:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transition-transform bg-white border-r border-gray-200 shadow-elevation-low",
          {"translate-x-0": mobileMenuOpen || !isMobile},
          {"-translate-x-full": !mobileMenuOpen && isMobile},
          "duration-300 ease-in-out"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary">Finance App</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="py-4 px-3 mt-2">
            <div className="flex flex-col gap-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-md transition-all",
                    "hover:bg-gray-100",
                    item.active ? "bg-gray-100 text-primary font-medium" : "text-gray-600"
                  )}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="mt-auto p-4 border-t">
            <div className="mb-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 grid place-items-center">
                  <span className="font-medium text-primary">
                    {user?.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user?.name}</p>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isMobile ? "ml-0" : (sidebarOpen ? "ml-64" : "ml-0")
      )}>
        {/* Toggle button for desktop */}
        {!isMobile && (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="fixed left-4 top-4 z-30 rounded-full shadow-elevation-medium bg-white/80 backdrop-blur-sm"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        )}
        <div className="min-h-screen pt-16 pb-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto page-transition">
          {children}
        </div>
      </main>
    </div>
  );
};
