import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfileForm } from '../components/UserProfileForm';
import { Icons } from '@/components/ui/icons';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <Icons.logout className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account's profile information and email address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserProfileForm />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Details about your account and membership.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Account Status
                  </p>
                  <div className="mt-1 flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="ml-2 text-sm">Active</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Member Since
                  </p>
                  <p className="mt-1 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Login
                  </p>
                  <p className="mt-1 text-sm">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'First login'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-destructive">
                        Delete Account
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all of your data.
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      <Icons.trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
