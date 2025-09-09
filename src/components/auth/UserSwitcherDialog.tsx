"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Users, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile } from "@/types";

interface UserSwitcherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define our demo users with different access levels
const DEMO_USERS: UserProfile[] = [
  {
    id: "hermione-granger",
    email: "hermione.granger@dewey-cheatham-howe.law",
    full_name: "Hermione Granger",
    role: "facilities",
    department: "Facilities Management",
    floors_access: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "ron-weasley",
    email: "ron.weasley@dewey-cheatham-howe.law",
    full_name: "Ron Weasley",
    role: "employee",
    department: "Legal",
    floors_access: [12, 13],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const getRoleIcon = (role: string) => {
  switch (role) {
    case "facilities":
      return <Shield className="h-4 w-4" />;
    case "admin":
      return <Building2 className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

const getRoleDescription = (role: string) => {
  switch (role) {
    case "facilities":
      return "Full access to all data including meeting details, analytics, and service management";
    case "employee":
      return "Limited access - cannot see meeting names or attendee details for privacy";
    default:
      return "Standard employee access";
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "facilities":
      return "default" as const;
    case "admin":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
};

export function UserSwitcherDialog({ open, onOpenChange }: UserSwitcherDialogProps) {
  const { user, switchUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleUserSwitch = async (newUser: UserProfile) => {
    setIsLoading(true);
    
    // Simulate a brief loading state for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    
    switchUser(newUser);
    setIsLoading(false);
    onOpenChange(false);
    
    // Force a page refresh to ensure all components update with new permissions
    window.location.reload();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Switch User Account
          </DialogTitle>
          <DialogDescription>
            Select a demo user to simulate different access levels. This demonstrates how Row Level Security (RLS) 
            would restrict data access based on user roles in a production environment.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {DEMO_USERS.map((demoUser) => {
            const isCurrentUser = user?.id === demoUser.id;
            
            return (
              <div
                key={demoUser.id}
                className={`relative rounded-lg border p-4 transition-all cursor-pointer hover:bg-gray-50 ${
                  isCurrentUser ? "border-primary bg-primary/5" : "border-gray-200"
                }`}
                onClick={() => !isCurrentUser && handleUserSwitch(demoUser)}
              >
                {isCurrentUser && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="default" className="gap-1">
                      <Check className="h-3 w-3" />
                      Current
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={`${
                      demoUser.role === "facilities" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-secondary-foreground"
                    }`}>
                      {getInitials(demoUser.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {demoUser.full_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {demoUser.email}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(demoUser.role)} className="gap-1">
                        {getRoleIcon(demoUser.role)}
                        {demoUser.role === "facilities" ? "Facilities Manager" : "Legal Associate"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {demoUser.department}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      {getRoleDescription(demoUser.role)}
                    </p>
                    
                    <div className="text-xs text-gray-500">
                      Access to floors: {demoUser.floors_access.join(", ")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-2">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Row Level Security (RLS) Simulation</p>
              <p className="text-blue-700">
                In production, Supabase RLS policies would automatically filter data based on the authenticated user's 
                role and permissions. This demo simulates that behavior by filtering meeting names and sensitive data 
                client-side based on the selected user profile.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}