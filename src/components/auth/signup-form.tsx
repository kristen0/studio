
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, type Firestore } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z
  .object({
    displayName: z.string().min(1, 'Name is required.'),
    email: z.string().email('Invalid email address.'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

// This function now acts as an "upsert." It creates the user document if it doesn't
// exist, or merges new information (like a changed display name) if it does.
export const upsertUserInFirestore = async (user: User, db: Firestore) => {
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const userDoc = await getDoc(userDocRef);
    const userData = {
      id: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL || null,
      createdAt: userDoc.exists() ? userDoc.data().createdAt : serverTimestamp(), // Preserve original creation date
      updatedAt: serverTimestamp(),
    };

    // setDoc with merge will create or update the document.
    await setDoc(userDocRef, userData, { merge: true });

  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: userDocRef.path,
      operation: 'write', 
      requestResourceData: {
          id: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
      },
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw the error to be caught by the calling function's catch block
    throw error;
  }
};


export function SignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;
      
      // Update the auth profile first
      await updateProfile(user, { displayName: values.displayName });

      // Reload user to get the updated profile information before writing to Firestore
      await user.reload();
      const freshUser = auth.currentUser;
      if (freshUser) {
        await upsertUserInFirestore(freshUser, db);
      }

      toast({
        title: 'Account Created',
        description: 'Welcome to StockCuts!',
      });
      router.push('/inventory/dashboard');
    } catch (error: any) {
        // This will primarily catch auth errors, since Firestore errors are now emitted.
        if (!(error instanceof FirestorePermissionError)) {
            console.error('Signup Error: ', error);
            toast({
                variant: 'destructive',
                title: 'Signup Failed',
                description:
                error.code === 'auth/email-already-in-use'
                    ? 'This email is already registered.'
                    : 'An unexpected error occurred. Please try again.',
            });
        }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Create an Account</CardTitle>
        <CardDescription>
          Join StockCuts to start managing your inventory smartly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
