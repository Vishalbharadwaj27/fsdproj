import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/ui/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional(),
}).refine((data) => {
  // Only validate passwords if currentPassword is provided
  if (data.currentPassword || data.newPassword || data.confirmNewPassword) {
    return data.newPassword?.length >= 6 && data.newPassword === data.confirmNewPassword;
  }
  return true;
}, {
  message: "Passwords don't match or are too short (min 6 characters)",
  path: ['confirmNewPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfileFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ onSuccess, className }) => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPEG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB',
        variant: 'destructive',
      });
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!isDirty && !avatarFile) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Only append fields that have changed
      if (data.name !== user?.name) formData.append('name', data.name);
      if (data.email !== user?.email) formData.append('email', data.email);
      
      // Handle password change if current password is provided
      if (data.currentPassword) {
        formData.append('currentPassword', data.currentPassword);
        if (data.newPassword) formData.append('newPassword', data.newPassword);
      }
      
      // Handle avatar upload if changed
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await updateUser(Object.fromEntries(formData) as any);
      
      // Reset form with new values
      reset({
        name: data.name,
        email: data.email,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      
      setAvatarFile(null);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Failed to update profile',
        description: error.message || 'An error occurred while updating your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      <div className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarPreview || user?.avatar || ''} alt={user?.name} />
              <AvatarFallback>
                {user?.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Icons.camera className="h-4 w-4" />
              <span className="sr-only">Upload avatar</span>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium">Profile Photo</h3>
            <p className="text-sm text-muted-foreground">
              JPG, GIF or PNG. Max size of 2MB
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              disabled={isLoading}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              disabled={isLoading}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-medium">Change Password</h4>
          <p className="text-sm text-muted-foreground">
            Leave these fields empty to keep your current password.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                {...register('currentPassword')}
              />
              {errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register('newPassword')}
                />
                {errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register('confirmNewPassword')}
                />
                {errors.confirmNewPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmNewPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading || !isDirty}
          onClick={() => {
            reset({
              name: user?.name || '',
              email: user?.email || '',
              currentPassword: '',
              newPassword: '',
              confirmNewPassword: '',
            });
            setAvatarFile(null);
            setAvatarPreview(null);
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || (!isDirty && !avatarFile)}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
};

// export default UserProfileForm;
