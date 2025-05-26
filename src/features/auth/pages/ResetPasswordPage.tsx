import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { Icons } from '@/components/ui/icons';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

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
              "With Task Trailblazer, our team collaboration has reached new heights. 
              The perfect tool for managing projects of any size."
            </p>
            <footer className="text-sm">Emily Chen, Development Lead</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground">
              {email ? `Enter a new password for ${email}` : 'Enter your new password'}
            </p>
          </div>
          <ResetPasswordForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <a
              href="/login"
              className="hover:text-brand underline underline-offset-4"
            >
              Back to login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
