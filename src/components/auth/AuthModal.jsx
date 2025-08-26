import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'reset'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const { login, signup, resetPassword } = useAuth();

  const getSchema = () => {
    switch (mode) {
      case 'signup': return signupSchema;
      case 'reset': return resetSchema;
      default: return loginSchema;
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(getSchema()),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let result;
      
      if (mode === 'login') {
        result = await login(data.email, data.password);
      } else if (mode === 'signup') {
        result = await signup(data.email, data.password, data.name);
      } else if (mode === 'reset') {
        result = await resetPassword(data.email);
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => setMode('login'), 3000);
        return;
      }

      if (result.success) {
        setMessage({ type: 'success', text: 'Welcome to Vyvoxa!' });
        setTimeout(onClose, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      
      // Set specific field errors if needed
      if (error.message.includes('email')) {
        setError('email', { message: error.message });
      } else if (error.message.includes('password')) {
        setError('password', { message: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setMessage({ type: '', text: '' });
    reset();
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'reset': return 'Reset Password';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup': return 'Join the Vyvoxa community today';
      case 'reset': return 'Enter your email to reset your password';
      default: return 'Sign in to your account';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-3xl border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-between items-center mb-4">
              {mode !== 'login' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => switchMode('login')}
                  className="rounded-full"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex-1" />
              <motion.div
                whileHover={{ rotate: 10, scale: 1.05 }}
                className="h-10 w-10 grid place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 shadow-lg"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                ×
              </Button>
            </div>
            <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
            <p className="text-muted-foreground">{getSubtitle()}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <AnimatePresence mode="wait">
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-2 p-3 rounded-2xl text-sm ${
                    message.type === 'error'
                      ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                      : 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400'
                  }`}
                >
                  {message.type === 'error' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...register('name')}
                      placeholder="Full Name"
                      className="pl-9 rounded-2xl"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="Email address"
                    className="pl-9 rounded-2xl"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {mode !== 'reset' && (
                <>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        className="pl-9 pr-9 rounded-2xl"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 rounded-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                  </div>

                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...register('confirmPassword')}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm Password"
                          className="pl-9 pr-9 rounded-2xl"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-8 w-8 rounded-full"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  )}
                </>
              )}

              <Button
                type="submit"
                className="w-full rounded-2xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : mode === 'signup' ? (
                  'Create Account'
                ) : mode === 'reset' ? (
                  'Send Reset Email'
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {mode === 'login' && (
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => switchMode('reset')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Forgot your password?
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Separator />
            <div className="text-center text-sm">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <Button
                    variant="link"
                    onClick={() => switchMode('signup')}
                    className="p-0 h-auto font-semibold"
                  >
                    Sign up
                  </Button>
                </p>
              ) : mode === 'signup' ? (
                <p>
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    onClick={() => switchMode('login')}
                    className="p-0 h-auto font-semibold"
                  >
                    Sign in
                  </Button>
                </p>
              ) : (
                <p>
                  Remember your password?{' '}
                  <Button
                    variant="link"
                    onClick={() => switchMode('login')}
                    className="p-0 h-auto font-semibold"
                  >
                    Sign in
                  </Button>
                </p>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
