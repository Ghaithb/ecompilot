import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="login-page"><p className="page-loading">Chargement…</p></main>}>
      <LoginForm />
    </Suspense>
  );
}
