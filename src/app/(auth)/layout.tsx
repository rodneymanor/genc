"use client";

import { AuthProvider } from "@/contexts/AuthContext";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthProvider>
      <main className="flex flex-col items-center justify-center h-screen">
        {children}
      </main>
    </AuthProvider>
  );
}
