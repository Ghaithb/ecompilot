'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { ProviderCredential } from '@/lib/types';
import { PROVIDER_LABELS } from '@/lib/types';

const PROVIDERS = ['intigo', 'first_delivery', 'shipper', 'aramex', 'rapid_poste', 'mylerz'];

export default function DeliveryConnectPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState('first_delivery');
  const [token, setToken] = useState('');
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState('');

  const { data: credentials = [], isLoading } = useQuery({
    queryKey: ['delivery-credentials'],
    queryFn: () => apiFetch<ProviderCredential[]>('/delivery/settings/credentials'),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      apiFetch('/delivery/settings/credentials', {
        method: 'POST',
        body: JSON.stringify({ provider: selected, token, label: label || undefined }),
      }),
    onSuccess: () => {
      setMessage('Clé enregistrée');
      setToken('');
      queryClient.invalidateQueries({ queryKey: ['delivery-credentials'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-overview'] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const testMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ ok?: boolean; message?: string }>(`/delivery/providers/${selected}/test`, {
        method: 'POST',
      }),
    onSuccess: (res) => setMessage(res.ok ? 'Connexion OK' : res.message || 'Échec test'),
    onError: (e: Error) => setMessage(e.message),
  });

  const configured = new Set(credentials.map((c) => c.provider));

  return (
    <div className="page">
      <h1>Connecter un transporteur</h1>
      <p className="muted">Enregistrez la clé API par transporteur (chiffrée côté serveur).</p>

      <div className="connect-grid">
        <section className="card">
          <h2>Transporteurs</h2>
          {isLoading && <p className="muted">Chargement…</p>}
          <ul className="provider-list">
            {PROVIDERS.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  className={`provider-btn ${selected === id ? 'active' : ''}`}
                  onClick={() => setSelected(id)}
                >
                  {PROVIDER_LABELS[id] || id}
                </button>
                <span className={configured.has(id) ? 'badge success' : 'badge'}>
                  {configured.has(id) ? 'Configuré' : 'Non configuré'}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>Clé API — {PROVIDER_LABELS[selected]}</h2>
          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              setMessage('');
              saveMutation.mutate();
            }}
          >
            <label>
              Token / clé API
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Coller la clé transporteur"
                required
              />
            </label>
            <label>
              Label (optionnel)
              <input value={label} onChange={(e) => setLabel(e.target.value)} />
            </label>
            <div className="actions-row">
              <button type="submit" className="btn-primary" disabled={saveMutation.isPending}>
                Enregistrer
              </button>
              <button
                type="button"
                className="btn-ghost"
                disabled={testMutation.isPending}
                onClick={() => {
                  setMessage('');
                  testMutation.mutate();
                }}
              >
                Tester connexion
              </button>
            </div>
          </form>
          {message && <p className={message.includes('OK') ? 'success-text' : 'error'}>{message}</p>}
        </section>
      </div>
    </div>
  );
}
