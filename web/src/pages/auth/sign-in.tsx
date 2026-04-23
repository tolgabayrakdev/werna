import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError } from '@/api/client';

const RESEND_COOLDOWN = 30;

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationUserId, setVerificationUserId] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stateUserId = (location.state as { userId?: string })?.userId;
    if (stateUserId) {
      setVerificationUserId(stateUserId);
      setNeedsVerification(true);
      setCooldown(RESEND_COOLDOWN);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  useEffect(() => {
    const stored = sessionStorage.getItem('verificationUserId');
    if (stored) {
      setVerificationUserId(stored);
      setNeedsVerification(true);
      setCooldown(RESEND_COOLDOWN);
      sessionStorage.removeItem('verificationUserId');
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || isResending) return;
    setSuccess('');
    setError('');
    setIsResending(true);

    try {
      if (verificationUserId) {
        await authService.resendVerification(verificationUserId);
      } else {
        const result = await authService.resendVerificationByEmail(email);
        if (result?.data?.userId) {
          setVerificationUserId(result.data.userId);
        }
      }
      setSuccess('Doğrulama kodu e-posta adresinize gönderildi.');
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Kod gönderilirken bir hata oluştu.');
      }
    } finally {
      setIsResending(false);
    }
  }, [cooldown, isResending, verificationUserId, email]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationUserId) {
      setError('Doğrulama bilgisi bulunamadı. Lütfen doğrulama kodunu yeniden gönderin.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      await authService.verify({ userId: verificationUserId, code });
      setNeedsVerification(false);
      setCode('');
      setError('');
      setSuccess('');
      setEmail('');
      setPassword('');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Doğrulama sırasında bir hata oluştu.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.message === 'Please verify your email first') {
          setNeedsVerification(true);
          setCooldown(RESEND_COOLDOWN);
        }
      } else {
        setError('Giriş yapılırken bir hata oluştu.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (needsVerification) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">E-posta Doğrulama</CardTitle>
          <CardDescription>E-posta adresinize gönderilen 6 haneli kodu girin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
                {success}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="code">Doğrulama Kodu</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required
                maxLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Doğrulanıyor...' : 'Doğrula'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
            >
              {isResending
                ? 'Gönderiliyor...'
                : cooldown > 0
                  ? `Kodu Yeniden Gönder (${cooldown}s)`
                  : 'Kodu Yeniden Gönder'}
            </Button>
            <button
              type="button"
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                setNeedsVerification(false);
                setError('');
                setSuccess('');
                setCode('');
              }}
            >
              Giriş formuna dön
            </button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Giriş Yap</CardTitle>
        <CardDescription>Hesabınıza giriş yapın</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Hesabın yok mu?{' '}
            <Link to="/sign-up" className="text-primary underline underline-offset-4 hover:no-underline">
              Kayıt Ol
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}