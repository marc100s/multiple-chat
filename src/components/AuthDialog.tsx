import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: (user: any, accessToken: string) => void;
}

export function AuthDialog({ open, onOpenChange, onAuthSuccess }: AuthDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [signinData, setSigninData] = useState({
    email: '',
    password: ''
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b21717d1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(signupData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Signup failed');
      }

      // Sign in after successful signup
      await handleSignin(e, true);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent, afterSignup = false) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );

      const emailToUse = afterSignup ? signupData.email : signinData.email;
      const passwordToUse = afterSignup ? signupData.password : signinData.password;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: passwordToUse,
      });

      if (error) {
        throw error;
      }

      if (data.session?.access_token) {
        onAuthSuccess(data.user, data.session.access_token);
        onOpenChange(false);
        
        // Reset forms
        setSignupData({ name: '', email: '', password: '' });
        setSigninData({ email: '', password: '' });
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Chat Ecosystem</DialogTitle>
          <DialogDescription>
            Sign in to access your personalized chat integrations or create a new account to get started.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignin} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={signinData.email}
                  onChange={(e) => setSigninData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signinData.password}
                  onChange={(e) => setSigninData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  value={signupData.name}
                  onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Sign Up
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        {error && (
          <Alert>
            <AlertDescription className="text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}