import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await forgotPassword(data.email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Password reset email sent
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  We've sent you an email with instructions to reset your password.
                  Please check your inbox.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Button
          onClick={() => navigate('/login')}
          className="mt-4 w-full"
          variant="outline"
        >
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Forgot your password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            disabled={isLoading}
            className={cn(
              errors.email && 'border-destructive focus-visible:ring-destructive',
            )}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
      </form>

      <p className="px-8 text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <a
          href="/login"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign in
        </a>
      </p>
    </div>
  );
};

// export default ForgotPasswordForm;
