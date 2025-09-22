import React, { useEffect, useMemo, useState } from 'react';
import { http } from './lib/api';
import { decodeJwt, isExpired } from './lib/jwt';
import type { JwtPayload } from './lib/jwt';

type LoginResp = { accessToken: string; user: { id: string; name: string; email: string; companyId: string } };

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, id, className='', ...rest } = props;
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      <input
        id={id ?? label}
        className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
        {...rest}
      />
    </label>
  );
}

export default function App() {
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [companyId, setCompanyId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // register
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt') || null);

  useEffect(() => {
    if (token) localStorage.setItem('jwt', token);
    else localStorage.removeItem('jwt');
  }, [token]);

  const payload: JwtPayload | null = useMemo(() => decodeJwt(token || ''), [token]);
  const expired = isExpired(payload);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        const data = await http<LoginResp>('/auth/login', {
          method: 'POST',
          body: { email, password },   // 👈 sem companyId
        });
        setToken(data.accessToken);
      } else {
        const data = await http<LoginResp>('/auth/register', {
          method: 'POST',
          body: { companyId, name, email, password }, // register continua pedindo
        });
        setToken(data.accessToken);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Erro inesperado');
    } finally {
      setBusy(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(()=>{});
  }

  function logout() {
    setToken(null);
  }

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Login</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('login')}
                className={`px-3 py-1.5 rounded-xl text-sm ${mode==='login' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >Login</button>
              <button
                onClick={() => setMode('register')}
                className={`px-3 py-1.5 rounded-xl text-sm ${mode==='register' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >Register</button>
            </div>
          </header>

          <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
            <Field label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@empresa.com" required />
            {mode === 'register' && (
              <Field label="Company ID (UUID)" value={companyId} onChange={e=>setCompanyId(e.target.value)} placeholder="ex: 3f7c..." required />
            )}
            <Field label="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />

            <div className="md:col-span-2 flex items-center justify-between mt-2">
              <div className="text-sm text-rose-600 h-6">{error}</div>
              <button
                disabled={busy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {busy ? 'Enviando...' : (mode==='login' ? 'Entrar' : 'Registrar')}
              </button>
            </div>
          </form>

          {!!token && (
            <section className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                {/* <h2 className="text-lg font-semibold">Token</h2> */}
                {/* <div className="flex gap-2">
                  <button onClick={()=>copy(token)} className="px-3 py-1.5 rounded-xl text-sm bg-slate-100">Copiar</button>
                  <button onClick={logout} className="px-3 py-1.5 rounded-xl text-sm bg-slate-100">Limpar</button>
                </div> */}
              </div>
              <pre className="overflow-auto text-xs bg-slate-900 text-slate-100 p-4 rounded-xl">{token}</pre>

              {/* <div className="flex items-center justify-between mt-2">
                <h3 className="font-medium">Payload decodificado</h3>
                {expired ? <span className="text-xs px-2 py-1 rounded bg-rose-100 text-rose-700">Expirado</span>
                         : <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">Válido</span>}
              </div>
              <pre className="overflow-auto text-xs bg-slate-100 text-slate-800 p-4 rounded-xl">
                {JSON.stringify(payload, null, 2)}
              </pre>

              <p className="text-sm text-slate-500">
                Use o token acima como <code>Authorization: Bearer &lt;token&gt;</code> no Postman.
              </p> */}
            </section>
          )}
        </div>

        <footer className="mt-4 text-center text-xs text-slate-500">
        </footer>
      </div>
    </div>
  );
}
