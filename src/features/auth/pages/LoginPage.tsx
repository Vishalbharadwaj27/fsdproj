import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRequireNoAuth } from '../hooks/useAuthGuard';
import { LoginForm } from '../components/LoginForm';
import { Icons } from '@/components/ui/icons';

export const LoginPage: React.FC = () => {
  const { isLoading } = useRequireNoAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Icons.logo className="mr-2 h-6 w-6" />
          Task Trailblazer
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Task Trailblazer has transformed the way our team manages projects. 
              The intuitive interface and powerful features make it a joy to use."
            </p>
            <footer className="text-sm">Sarah Johnson, Project Manager</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to sign in to your account
            </p>
          </div>
          <LoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link
              to="/forgot-password"
              className="hover:text-brand underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </p>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="hover:text-brand underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
