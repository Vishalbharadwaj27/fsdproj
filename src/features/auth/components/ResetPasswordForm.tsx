import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/ui/icons';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!email || !token) {
      setError('Invalid reset link. Please request a new password reset link.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPassword({
        email,
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          <p>Invalid or expired reset link. Please request a new password reset link.</p>
        </div>
        <Button
          onClick={() => navigate('/forgot-password')}
          className="mt-4 w-full"
          variant="outline"
        >
          Request new reset link
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Password reset successful
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your password has been successfully updated.</p>
              </div>
            </div>
          </div>
        </div>
        <Button
          onClick={() => navigate('/login')}
          className="mt-4 w-full"
        >
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isLoading}
            className={cn(
              errors.newPassword && 'border-destructive focus-visible:ring-destructive',
            )}
            {...register('newPassword')}
          />
          {errors.newPassword && (
            <p className="text-sm text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isLoading}
            className={cn(
              errors.confirmPassword && 'border-destructive focus-visible:ring-destructive',
            )}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Reset password
        </Button>
      </form>
    </div>
  );
};

// export default ResetPasswordForm;
