// src/components/Auth/LoginWithEmail.tsx
import { useState } from 'react';
import { loginWithEmail, sendOTP, verifyOTP } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginWithEmailProps {
  onSwitchToTelegram?: () => void;
  onSwitchToRegister?: () => void;
  onLoginSuccess?: (userData: any) => void;
}

export const LoginWithEmail = ({ onSwitchToTelegram, onSwitchToRegister, onLoginSuccess }: LoginWithEmailProps) => {
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginWithEmail({
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        onLoginSuccess?.(result.profile);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await sendOTP(formData.email);

      if (result.success) {
        setOtpSent(true);
        setLoginMethod('otp');
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await verifyOTP(formData.email, formData.otp);

      if (result.success) {
        onLoginSuccess?.(result.profile);
      } else {
        setError(result.error || 'Invalid OTP');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login with Email</CardTitle>
        <CardDescription>Sign in to your account using your email</CardDescription>
      </CardHeader>
      
      {loginMethod === 'password' ? (
        <form onSubmit={handlePasswordLogin}>
          <CardContent className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login with Password'}
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSendOTP}
              type="button"
              disabled={loading}
            >
              Login with OTP
            </Button>
            
            <div className="flex justify-between w-full pt-2">
              <Button
                variant="ghost"
                onClick={onSwitchToRegister}
                type="button"
              >
                Register
              </Button>
              
              <Button
                variant="ghost"
                onClick={onSwitchToTelegram}
                type="button"
              >
                Login with Telegram
              </Button>
            </div>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          <CardContent className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={otpSent}
              />
            </div>
            
            {!otpSent ? (
              <div className="pt-4">
                <Button 
                  type="button" 
                  className="w-full" 
                  onClick={handleSendOTP}
                  disabled={loading}
                >
                  Send OTP
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                    placeholder="Enter 6-digit code"
                  />
                </div>
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    Verify OTP
                  </Button>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setLoginMethod('password');
                setOtpSent(false);
              }}
              type="button"
              disabled={loading}
            >
              Back to Password Login
            </Button>
            
            <div className="flex justify-between w-full pt-2">
              <Button
                variant="ghost"
                onClick={onSwitchToRegister}
                type="button"
              >
                Register
              </Button>
              
              <Button
                variant="ghost"
                onClick={onSwitchToTelegram}
                type="button"
              >
                Login with Telegram
              </Button>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};