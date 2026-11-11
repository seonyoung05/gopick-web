// src/pages/dev/sections/ApiTestSection.tsx
import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { authApi, ApiError } from '../../../api';

export function ApiTestSection() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('아직 요청 안 함');

  const run = async (label: string, call: () => Promise<unknown>) => {
    try {
      const data = await call();
      setResult(`✅ ${label} 성공\n${JSON.stringify(data ?? '(응답 본문 없음)', null, 2)}`);
    } catch (e) {
      if (e instanceof ApiError) {
        setResult(`❌ ${label} 실패\nstatus: ${e.status}\ncode: ${e.code}\nmessage: ${e.message}`);
      } else {
        setResult(`❌ ${label} 실패\n${String(e)}`);
      }
    }
  };

  return (
    <section style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
      <h1 className="t-h1">API 테스트 (계정)</h1>
      <Input placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button size="sm" onClick={() => run('회원가입', () => authApi.signUp({ email, password }))}>회원가입</Button>
        <Button size="sm" onClick={() => run('로그인', () => authApi.login({ email, password }))}>로그인</Button>
        <Button size="sm" variant="ghost" onClick={() => run('내 정보', () => authApi.getMe())}>내 정보 (/me)</Button>
        <Button size="sm" variant="ghost" onClick={() => run('로그아웃', () => authApi.logout())}>로그아웃</Button>
      </div>
      <pre className="t-caption" style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, whiteSpace: 'pre-wrap' }}>
        {result}
      </pre>
    </section>
  );
}