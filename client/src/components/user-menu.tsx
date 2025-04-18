import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { DiscordUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvatarUrl } from "@/lib/utils";
import { LogOut, User } from "lucide-react";

export default function UserMenu() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Define type for auth status response
  interface AuthStatusResponse {
    isLoggedIn: boolean;
    user?: DiscordUser;
  }
  
  // Fetch auth status
  const { data, isLoading } = useQuery<AuthStatusResponse>({
    queryKey: ["/api/auth/status"],
    refetchOnWindowFocus: true,
    // Add fetcher function to properly type the response
    queryFn: async () => {
      const response = await fetch('/api/auth/status');
      if (!response.ok) {
        throw new Error('Failed to fetch auth status');
      }
      return response.json() as Promise<AuthStatusResponse>;
    }
  });
  
  const isLoggedIn = data?.isLoggedIn;
  const user: DiscordUser | undefined = data?.user;
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/logout");
      return response.json() as Promise<{ message: string }>;
    },
    onSuccess: () => {
      // Invalidate auth status query to update UI
      queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout Failed",
        description: error.message || "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle logout click
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  if (isLoading) {
    return null;
  }
  
  if (!isLoggedIn || !user) {
    return null;
  }
  
  // Get avatar URL or use fallback
  const avatarUrl = user.avatar ? getAvatarUrl(user.id, user.avatar) : null;
  const userInitial = user.username.charAt(0).toUpperCase();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={user.username} />}
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email || "No email available"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => navigate("/token-checker")}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Token Checker</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-500 cursor-pointer focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}