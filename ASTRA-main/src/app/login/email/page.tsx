
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import Logo from '@/components/logo';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, UserCredential } from "firebase/auth";
import { addUserToDatabase } from '@/lib/database';

export default function EmailLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = getAuth();

  const handleSignIn = async () => {
    setError('');
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      await addUserToDatabase(userCredential.user);
      router.push('/jurisdiction');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        try {
          const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
          await addUserToDatabase(userCredential.user);
          router.push('/jurisdiction');
        } catch (createError: any) {
          setError(createError.message);
        }
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
           <Link href="/" className="flex items-center justify-center mb-4">
              <Logo className="h-20" />
            </Link>
          <CardTitle className="font-serif text-2xl">Sign In or Create Account</CardTitle>
          <CardDescription>Enter your email and password to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button className="w-full" onClick={handleSignIn}>Continue</Button>
           <div className="text-center mt-4">
              <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                Back to other sign-in methods
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
