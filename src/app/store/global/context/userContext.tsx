"use client"
import React, { createContext, useContext, useState, useEffect } from "react";

interface UserContextType {
  email: string;
  username: string;
  githubUsername?: string;
  primaryEmail?: string;
  gitlabUsername?: string;
  accessToken?: string;
  bitbucketUsername?: string;
}

interface UserContextValue {
  user: UserContextType;
  setUser: (user: UserContextType) => void;
  clearUser: () => void;
}

// Create default user object
const defaultUser: UserContextType = {
  email: "",
  username: "",
  githubUsername: "",
  primaryEmail: "",
  gitlabUsername: "",
  accessToken: "",
  bitbucketUsername: ""
};

export const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  // Helper function to properly log objects
  const logObject = (label: string, obj: any) => {
    console.log(`${label}:`, JSON.stringify(obj, null, 2));
  };

  // Initialize with data from localStorage if available
  const [user, setUserState] = useState<UserContextType>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          logObject("Loading user from localStorage", parsedUser);
          return parsedUser;
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
      }
    }
    return defaultUser;
  });

  // Save to localStorage whenever user changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('user', JSON.stringify(user));
        logObject("User saved to localStorage", user);
      } catch (error) {
        console.error("Error saving user to localStorage:", error);
      }
    }
  }, [user]);

  // Function to update user
  const setUser = (newUser: UserContextType) => {
    logObject("Setting user", newUser);
    
    // Validate the user data
    if (!newUser.email && !newUser.username && !newUser.githubUsername) {
      console.warn("Warning: Setting user with empty critical fields");
    }
    
    // Update the state
    setUserState(newUser);
    
    // Log the update
    console.log("User updated successfully");
  };

  // Function to clear user data
  const clearUser = () => {
    console.log("Clearing user data");
    setUserState(defaultUser);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for easier access to user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
