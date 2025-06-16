"use client"
import React, { createContext, useContext, useState, useEffect } from "react";

interface UserContextType {
  email: string;
  username: string;
  githubUsername?: string;
  primaryEmail?: string;
  gitlabUsername?: string;
  bitbucketUsername?: string;
  authToken? : string;
}

interface UserContextValue {
  user: UserContextType;
  setUser: (user: UserContextType) => void;
  clearUser: () => void;
}

export const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserContextType>(() => {
    // Try to get user data from localStorage on initial load
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : {
        email: "",
        username: "",
        githubUsername: "",
        primaryEmail: "",
        gitlabUsername: "",
        bitbucketUsername: ""
      };
    }
    return {
      email: "",
      username: "",
      githubUsername: "",
      primaryEmail: "",
      gitlabUsername: "",
      bitbucketUsername: ""
    };
  });

  // Save to localStorage whenever user changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    console.log("UserContext - Current user state:", user);
  }, [user]);

  const updateUser = (newUser: UserContextType) => {
    console.log("UserContext - Setting new user:", newUser);
    setUser(newUser);
  };

  const clearUser = () => {
    console.log("UserContext - Clearing user");
    setUser({
      email: "",
      username: "",
      githubUsername: "",
      primaryEmail: "",
      gitlabUsername: "",
      bitbucketUsername: ""
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};