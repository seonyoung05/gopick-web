// src/pages/dev/sections/ApiTestSection.tsx
import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ApiError } from '../../../api';
import { useAuth } from '../../../stores/auth';

export function ApiTestSection() {
  const { status, account, login, signUp, logout, refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const run = async (label: string, call: () => Promise<unknown>) => {
    try {
      await call();
      setMessage(`✅ ${label} 성공`);
    } catch (e) {
      setMessage(e instanceof ApiError ? `❌ ${label} 실패: ${e.status} ${e.code}` : `❌ ${label} 실패`);
    }
  };

  return (
    <section style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
      <h1 className="t-h1">로그인 상태 테스트</h1>
      <pre className="t-caption" style={{ background: 'var(--surface)', padding: 16, borderRadius: 12 }}>
        {`상태: ${status}\n계정: ${account ? JSON.stringify(account) : '없음'}`}
      </pre>
      <Input placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button size="sm" onClick={() => run('회원가입', () => signUp({ email, password }))}>회원가입</Button>
        <Button size="sm" onClick={() => run('로그인', () => login({ email, password }))}>로그인</Button>
        <Button size="sm" variant="ghost" onClick={() => run('새로고침', refresh)}>서버에 다시 확인</Button>
        <Button size="sm" variant="ghost" onClick={() => run('로그아웃', logout)}>로그아웃</Button>
      </div>
      {message && <p className="t-body-s">{message}</p>}
    </section>
  );
}