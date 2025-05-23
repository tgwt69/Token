import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import TokenCheckerPage from "@/pages/token-checker";
import SavedTokens from "@/pages/saved-tokens";
import { ThemeProvider } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Database, Home as HomeIcon, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Navigation component
function Navigation() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Don't show navigation on the landing page
  if (location === "/") {
    return null;
  }
  
  return (
    <motion.div 
      className="flex flex-col md:flex-row justify-between items-center mb-6 px-4 py-3 bg-white dark:bg-neutral-800 shadow-sm w-full"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center w-full md:w-auto">
        <Link href="/">
          <div className="flex items-center">
            <span className="text-xl font-bold">Discord Token Checker</span>
          </div>
        </Link>
        
        {isMobile && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            )}
          </Button>
        )}
      </div>
      
      <div className={`${isMobile && !isMenuOpen ? 'hidden' : 'flex'} flex-col md:flex-row md:items-center mt-4 md:mt-0 space-y-2 md:space-y-0 md:space-x-3 w-full md:w-auto`}>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
          <Link href="/">
            <Button 
              variant={location === "/" ? "default" : "ghost"} 
              className="flex items-center w-full justify-start"
              size={isMobile ? "sm" : "default"}
            >
              <HomeIcon className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          
          <Link href="/token-checker">
            <Button 
              variant={location === "/token-checker" ? "default" : "ghost"} 
              className="flex items-center w-full justify-start"
              size={isMobile ? "sm" : "default"}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Token Checker
            </Button>
          </Link>
          
          <Link href="/saved-tokens">
            <Button 
              variant={location === "/saved-tokens" ? "default" : "ghost"} 
              className="flex items-center w-full justify-start"
              size={isMobile ? "sm" : "default"}
            >
              <Database className="mr-2 h-4 w-4" />
              Saved Tokens
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// Footer component with credits
function Footer() {
  const [location] = useLocation();
  
  // Don't show footer on the landing page as it already has credits
  if (location === "/") {
    return null;
  }
  
  return (
    <motion.footer 
      className="mt-12 py-6 text-center text-neutral-500 dark:text-neutral-400 text-sm border-t border-neutral-200 dark:border-neutral-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="container px-4">
        <p>© {new Date().getFullYear()} Discord Token Checker</p>
        <p className="mt-1">Created by _imjay • Join our Discord server at <a href="https://discord.gg/AeDeKW66wT" className="text-primary hover:underline">discord.gg/AeDeKW66wT</a></p>
      </div>
    </motion.footer>
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8 flex flex-col">
      <Navigation />
      <div className="container px-4 flex-grow">
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/token-checker" component={TokenCheckerPage} />
          <Route path="/saved-tokens" component={SavedTokens} />
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;