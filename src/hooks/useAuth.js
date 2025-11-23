"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onIdTokenChanged, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      // SEND TOKEN TO BACKEND → SETS httpOnly COOKIE
      const res = await fetch(`${BACKEND_URL}/api/users/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "include", // CRITICAL: SENDS & RECEIVES COOKIES
      });

      const data = await res.json();
      if (data.success && data.data?.token) {
        localStorage.setItem("authToken", data.data.token);
      }

      setUser(firebaseUser);
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch(`${BACKEND_URL}/api/users/logout`, {
      method: "POST",
      credentials: "include",
    });
    await signOut(auth);
    localStorage.removeItem("authToken");
    setUser(null);
    window.location.href = "/";
  };

  const getMe = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${BACKEND_URL}/api/users/getMe`, {
        credentials: "include", // SENDS THE COOKIE
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) {
        if (res.status === 401) setUser(null);
        throw new Error("Unauthorized");
      }

      const data = await res.json();
      // Normalize user data structure
      const userData = data.data?.user || data.user;

      // Add helper properties
      const normalizedUser = {
        ...userData,
        canAccessDashboard: ['admin', 'teacher', 'moderator'].includes(userData?.role),
        isAdmin: userData?.role === 'admin',
        isTeacher: userData?.role === 'teacher',
        isModerator: userData?.role === 'moderator',
      };

      setUser(normalizedUser);
      return normalizedUser;
    } catch (err) {
      setUser(null);
      throw err;
    }
  };

  // Auto-sync on token change (Firebase refreshes token every hour)
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();

          // Sync token with backend
          await fetch(`${BACKEND_URL}/api/users/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
            credentials: "include",
          });

          // Only fetch user data if we don't have it yet or if it's stale
          // This prevents unnecessary refetches on navigation
          if (!user || !user.email) {
            await getMe();
          }
        } catch (error) {
          console.error("Auth sync error:", error);
        }
      } else {
        setUser(null);
      }

      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []); // Remove user dependency to prevent infinite loops

  return { user, loading, login, logout, getMe };
};

export { useAuth };