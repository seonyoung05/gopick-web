// src/pages/auth/SignupPage.tsx
import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Field } from '../../components/common/Field';
import { useToast } from '../../components/common/Toast';
import { Button } from '../../components/ui/Button';
import { Input, PasswordInput } from '../../components/ui/Input';
import { ApiError, ERROR_CODE } from '../../api';
import { useAuth } from '../../stores/auth';
import { AuthLayout } from './AuthLayout';
import { PASSWORD_HELP, authErrorMessage, emailError, newPasswordError, pathAfterAuth } from './validateAuth';
import styles from './AuthPage.module.css';

export default function SignupPage() {
  const { status, account, signUp } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  /** 서버가 알려 준 칸별 오류 (예: 중복 이메일) */
  const [serverField, setServerField] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  if (status === 'authenticated') return <Navigate to={pathAfterAuth(account)} replace />;

  const errors = {
    email: serverField.email ?? emailError(email),
    password: serverField.password ?? newPasswordError(password),
    confirm: !confirm ? '비밀번호를 한 번 더 입력해 주세요.' : confirm !== password ? '비밀번호가 서로 달라요.' : undefined,
  };
  const show = (msg?: string) => (submitted ? msg : undefined);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError(null);
    if (errors.email || errors.password || errors.confirm) return;

    setSubmitting(true);
    try {
  await signUp({ email: email.trim(), password });
  toast('가입했어요! 프로필을 작성하면 팀원 추천을 받을 수 있어요', 'success');
  // 가입 직후엔 profileId가 null이라 위의 Navigate가 /profile로 보내 줘요
} catch (err) {
      if (err instanceof ApiError && err.code === ERROR_CODE.DUPLICATE_EMAIL) {
        setServerField({ email: '이미 가입된 이메일이에요. 로그인해 주세요.' });
      } else if (err instanceof ApiError && err.code === ERROR_CODE.VALIDATION_ERROR) {
        setServerField({
          email: err.fieldErrors.email ? '이메일 형식을 확인해 주세요.' : undefined,
          password: err.fieldErrors.password ? '비밀번호 규칙을 확인해 주세요. ' + PASSWORD_HELP : undefined,
        });
      } else {
        setServerError(authErrorMessage(err, '가입하지 못했어요. 잠시 후 다시 시도해 주세요.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.head}>
          <h1 className="t-h1">회원가입</h1>
          <p>이메일과 비밀번호만 있으면 바로 시작할 수 있어요. 가입 후 프로필을 작성하면 팀원 추천을 받을 수 있어요.</p>
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
              onChange={(e) => {
                setEmail(e.target.value);
                setServerField((prev) => ({ ...prev, email: undefined })); // 고치면 서버 오류 지우기
              }}
            />
          </Field>
          <Field
            label="비밀번호"
            htmlFor="password"
            help={show(errors.password) ? undefined : PASSWORD_HELP}
            error={show(errors.password)}
          >
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="비밀번호를 입력해 주세요"
              value={password}
              invalid={!!show(errors.password)}
              onChange={(e) => {
                setPassword(e.target.value);
                setServerField((prev) => ({ ...prev, password: undefined }));
              }}
            />
          </Field>
          <Field label="비밀번호 확인" htmlFor="confirm" error={show(errors.confirm)}>
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              placeholder="비밀번호를 한 번 더 입력해 주세요"
              value={confirm}
              invalid={!!show(errors.confirm)}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </Field>
        </div>

        {serverError && <p className={styles.alert} role="alert">{serverError}</p>}

        <Button type="submit" block disabled={submitting}>
          {submitting ? '가입하는 중…' : '가입하고 프로필 작성하기'}
        </Button>

        <p className={styles.footer}>
          이미 계정이 있나요?
          <Link to="/login">로그인</Link>
        </p>
      </form>
    </AuthLayout>
  );
}