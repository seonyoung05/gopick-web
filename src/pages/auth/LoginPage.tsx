// src/pages/auth/LoginPage.tsx
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Field } from '../../components/common/Field';
import { Button } from '../../components/ui/Button';
import { Input, PasswordInput } from '../../components/ui/Input';
import { useAuth } from '../../stores/auth';
import { AuthLayout } from './AuthLayout';
import { authErrorMessage, emailError, pathAfterAuth } from './validateAuth';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const { status, account, login } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // 로그인돼 있으면: 프로필 없으면 내 프로필, 있으면 원래 가려던 곳(없으면 홈)
  const from = (location.state as { from?: string } | null)?.from;
  if (status === 'authenticated') return <Navigate to={pathAfterAuth(account, from)} replace />;

  const errors = {
    email: emailError(email),
    password: password ? undefined : '비밀번호를 입력해 주세요.',
  };
  const show = (msg?: string) => (submitted ? msg : undefined);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 막기
    setSubmitted(true);
    setServerError(null);
    if (errors.email || errors.password) return;

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      // 이동은 위의 Navigate가 로그인 상태를 보고 알아서 처리
    } catch (err) {
      setServerError(authErrorMessage(err, '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.head}>
          <h1 className="t-h1">로그인</h1>
        </div>

        <div className={styles.fields}>
          <Field label="이메일" htmlFor="email" error={show(errors.email)}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="user@example.com"
              value={email}
              invalid={!!show(errors.email)}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="비밀번호" htmlFor="password" error={show(errors.password)}>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="비밀번호를 입력해 주세요"
              value={password}
              invalid={!!show(errors.password)}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </div>

        {serverError && <p className={styles.alert} role="alert">{serverError}</p>}

        <Button type="submit" block disabled={submitting}>
          {submitting ? '로그인 중…' : '로그인'}
        </Button>

        <p className={styles.footer}>
          아직 계정이 없나요?
          <Link to="/signup">회원가입</Link>
        </p>
      </form>
    </AuthLayout>
  );
}