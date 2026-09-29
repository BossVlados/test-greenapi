import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { createApiClient, getSettings } from '../api';
import type { Credentials } from '../types';

interface Props {
  onAuth: (creds: Credentials) => void;
}

export function AuthScreen({ onAuth }: Props) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: SubmitEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError(null);

    const normalizedPhone = phone.replace(/\D/g, '');
    if (
      !idInstance.trim() ||
      !apiTokenInstance.trim() ||
      normalizedPhone.length < 10
    ) {
      setError('Заполните все поля. Телефон — в формате 79991234567.');
      return;
    }

    setLoading(true);
    try {
      const client = createApiClient(idInstance, apiTokenInstance);
      await getSettings({ client, idInstance, apiTokenInstance });

      onAuth({
        idInstance: idInstance.trim(),
        apiTokenInstance: apiTokenInstance.trim(),
        phone: normalizedPhone,
      });
    } catch {
      setError(
        'Не удалось авторизоваться. Проверьте idInstance и apiTokenInstance.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <h1>MAX Chat</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="idInstance"
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
          autoComplete="off"
        />
        <input
          placeholder="apiTokenInstance"
          type="password"
          value={apiTokenInstance}
          onChange={(e) => setApiTokenInstance(e.target.value)}
          autoComplete="off"
        />
        <input
          placeholder="Номер получателя (79991234567)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="numeric"
        />
        {error && <div className="error-text">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}