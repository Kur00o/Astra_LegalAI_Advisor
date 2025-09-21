
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import Logo from '@/components/logo';
import { Mail, Phone } from 'lucide-react';
import { signInWithGoogle, setupRecaptcha, signInWithPhone, auth } from '@/lib/firebase';
import { addUserToDatabase } from '@/lib/database';
import { RecaptchaVerifier, ConfirmationResult, UserCredential } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // This effect will run once on mount to set up the reCAPTCHA verifier.
    const verifier = setupRecaptcha('recaptcha-container');
    if (verifier) {
      setRecaptchaVerifier(verifier);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const userCredential: UserCredential = await signInWithGoogle();
      await addUserToDatabase(userCredential.user);
      router.push('/jurisdiction');
    } catch (error) {
      console.error("Google sign-in error", error);
    }
  };
  
  const handleEmailSignIn = () => {
      router.push('/login/email');
  }

  const handlePhoneSignIn = async () => {
    if (recaptchaVerifier) {
      try {
        const result: ConfirmationResult = await signInWithPhone(phone, recaptchaVerifier);
        setConfirmationResult(result);
        setShowOtpInput(true);
      } catch (error) {
        console.error("Phone sign-in error", error);
      }
    }
  };

  const handleOtpSubmit = async () => {
    if (confirmationResult) {
      try {
        const userCredential: UserCredential = await confirmationResult.confirm(otp);
        await addUserToDatabase(userCredential.user);
        router.push('/jurisdiction');
      } catch (error) {
        console.error("OTP confirmation error", error);
      }
    } 
  };

  const handleSkip = () => {
    router.push('/jurisdiction');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div id="recaptcha-container"></div>
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
           <Link href="/" className="flex items-center justify-center mb-4">
              <Logo className="h-20" />
            </Link>
          <CardTitle className="font-serif text-2xl">Create an Account or Sign In</CardTitle>
          <CardDescription>Choose your preferred method to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showOtpInput ? (
            <div className="space-y-4">
                <p className='text-center text-sm'>Enter the code sent to {phone}</p>
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="- - - - - -" />
                </div>
                <Button className="w-full" onClick={handleOtpSubmit}>Confirm Code</Button>
                 <Button variant="link" className="w-full text-sm" onClick={() => setShowOtpInput(false)}>
                    Back to sign in methods
                </Button>
            </div>
          ) : (
            <div className="space-y-2">
                <Button className="w-full" onClick={handleGoogleSignIn}>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_17_80)"><path fill="#4285F4" d="M43.611 20.083H42V20H24V28H35.303C33.674 32.69 29.223 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C29.223 12 33.674 15.31 35.303 20H43.611C42.223 11.957 33.918 6 24 6C13.518 6 4.965 13.987 4.965 24C4.965 34.013 13.518 42 24 42C33.918 42 42.223 36.043 43.611 28H35.303V20.083Z"></path></g><defs><clipPath id="clip0_17_80"><rect width="48" height="48" fill="white"></rect></clipPath></defs></svg>
                    Sign in with Google
                </Button>
                <Button variant="outline" className="w-full" onClick={handleEmailSignIn}>
                    <Mail className="mr-2 h-4 w-4" />
                    Sign in with Email
                </Button>
                <div className="space-y-2 pt-2">
                     <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex space-x-2">
                        <Input id="phone" type="tel" placeholder="+1 123 456 7890" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <Button onClick={handlePhoneSignIn}><Phone className="h-4 w-4" /></Button>
                    </div>
                </div>
                 <div className="relative pt-2">
                    <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or
                    </span>
                    </div>
                </div>
                <Button variant="link" className="w-full" onClick={handleSkip}>
                    Skip for now
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
