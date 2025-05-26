import React from 'react';
import { Link } from 'react-router-dom';
import { useRequireNoAuth } from '../hooks/useAuthGuard';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { Icons } from '@/components/ui/icons';

const ForgotPasswordPage: React.FC = () => {
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
              "Task Trailblazer's intuitive interface makes project management 
              a breeze. Our team is more organized than ever before."
            </p>
            <footer className="text-sm">Alex Rodriguez, Product Manager</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Forgot your password?
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>
          <ForgotPasswordForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link
              to="/login"
              className="hover:text-brand underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
