import { useState } from 'react';
import { STRAPI_URL } from '../lib/strapi';
import styles from '../styles/forms.module.css';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface FormErrors {
  nombre?: string;
  email?: string;
  asunto?: string;
  mensaje?: string;
  consentimiento?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactForm() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [consentimiento, setConsentimiento] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!nombre.trim() || nombre.trim().length < 3) e.nombre = 'Ingrese su nombre completo (mínimo 3 caracteres).';
    if (!email.trim() || !validateEmail(email.trim())) e.email = 'Ingrese un correo electrónico válido.';
    if (!asunto.trim() || asunto.trim().length < 3) e.asunto = 'Ingrese el asunto (mínimo 3 caracteres).';
    if (!mensaje.trim() || mensaje.trim().length < 10) e.mensaje = 'El mensaje debe tener al menos 10 caracteres.';
    if (!consentimiento) e.consentimiento = 'Debe aceptar el tratamiento de datos.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (honeypot.trim() !== '') {
      setStatus('success');
      setMessage('Mensaje enviado correctamente. Nos pondremos en contacto pronto.');
      return;
    }
    if (!validate()) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(`${STRAPI_URL}/api/mensajes-contacto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          data: {
            nombre: nombre.trim(),
            email: email.trim(),
            asunto: asunto.trim(),
            mensaje: mensaje.trim(),
            consentimiento: true,
          },
        }),
      });

      if (!res.ok) {
        let body = '';
        try {
          body = await res.text();
          const j = JSON.parse(body);
          const detail = j?.error?.message || j?.message || body;
          body = typeof detail === 'string' ? detail.slice(0, 500) : body.slice(0, 500);
        } catch {
          body = body.slice(0, 500);
        }
        throw new Error(body || `Error ${res.status}`);
      }

      setStatus('success');
      setMessage('¡Mensaje enviado correctamente! Un miembro del equipo administrativo dará respuesta al correo indicado.');
      setNombre('');
      setEmail('');
      setAsunto('');
      setMensaje('');
      setConsentimiento(false);
      setErrors({});
    } catch (err: any) {
      console.error('[ContactForm] fetch error', err);
      const msg = err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')
        ? 'No se pudo conectar con el servidor. Verifique su conexión o intente más tarde.'
        : err?.message || 'Ocurrió un error al enviar el mensaje. Intente nuevamente.';
      setStatus('error');
      setMessage(msg);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={styles.form}
      aria-label="Formulario de contacto"
      style={{ position: 'relative' }}
    >
      {/* Honeypot */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          opacity: 0,
        }}
      >
        <label htmlFor="contact-website">No diligenciar este campo</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="contact-nombre">
            Nombre completo
            <span className={styles.fieldRequired}>*</span>
          </label>
          <input
            id="contact-nombre"
            name="nombre"
            type="text"
            required
            autoComplete="name"
            aria-label="Nombre completo"
            aria-required="true"
            aria-invalid={!!errors.nombre}
            aria-describedby={errors.nombre ? 'err-contact-nombre' : undefined}
            className={errors.nombre ? styles.fieldInputError : ''}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: María Pérez"
          />
          {errors.nombre && (
            <span id="err-contact-nombre" role="alert" className={styles.fieldError}>
              {errors.nombre}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-email">
            Correo electrónico
            <span className={styles.fieldRequired}>*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-label="Correo electrónico"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'err-contact-email' : undefined}
            className={errors.email ? styles.fieldInputError : ''}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@correo.com"
          />
          {errors.email && (
            <span id="err-contact-email" role="alert" className={styles.fieldError}>
              {errors.email}
            </span>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-asunto">
          Asunto
          <span className={styles.fieldRequired}>*</span>
        </label>
        <input
          id="contact-asunto"
          name="asunto"
          type="text"
          required
          autoComplete="off"
          aria-label="Asunto del mensaje"
          aria-required="true"
          aria-invalid={!!errors.asunto}
          aria-describedby={errors.asunto ? 'err-contact-asunto' : undefined}
          className={errors.asunto ? styles.fieldInputError : ''}
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Ej: Consulta académica"
        />
        {errors.asunto && (
          <span id="err-contact-asunto" role="alert" className={styles.fieldError}>
            {errors.asunto}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-mensaje">
          Mensaje
          <span className={styles.fieldRequired}>*</span>
        </label>
        <textarea
          id="contact-mensaje"
          name="mensaje"
          rows={5}
          required
          autoComplete="off"
          aria-label="Mensaje"
          aria-required="true"
          aria-invalid={!!errors.mensaje}
          aria-describedby={errors.mensaje ? 'err-contact-mensaje' : undefined}
          className={errors.mensaje ? styles.fieldInputError : ''}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Describa su consulta con el mayor detalle posible..."
        />
        {errors.mensaje && (
          <span id="err-contact-mensaje" role="alert" className={styles.fieldError}>
            {errors.mensaje}
          </span>
        )}
      </div>

      {/* Consentimiento */}
      <div className={styles.field}>
        <label htmlFor="contact-consentimiento" className={styles.consent}>
          <input
            id="contact-consentimiento"
            name="consentimiento"
            type="checkbox"
            required
            aria-label="Autorizo el tratamiento de mis datos personales"
            aria-required="true"
            aria-invalid={!!errors.consentimiento}
            checked={consentimiento}
            onChange={(e) => setConsentimiento(e.target.checked)}
          />
          <span>
            Autorizo el tratamiento de mis datos personales conforme a la{' '}
            <a href="/manual-convivencia" target="_blank" rel="noopener noreferrer">
              política de privacidad
            </a>{' '}
            y la Ley 1581 de 2012. *
          </span>
        </label>
        {errors.consentimiento && (
          <span role="alert" className={styles.fieldError}>
            {errors.consentimiento}
          </span>
        )}
      </div>

      <button
        className={styles.submit}
        type="submit"
        disabled={status === 'loading'}
        aria-busy={status === 'loading'}
        aria-label={status === 'loading' ? 'Enviando mensaje' : 'Enviar mensaje'}
      >
        {status === 'loading' && <span className={styles.loadingSpinner} />}
        {status === 'loading' ? 'Enviando…' : 'Enviar mensaje'}
      </button>

      {message && (
        <div
          role={status === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`${styles.statusMessage} ${status === 'success' ? styles.statusSuccess : status === 'error' ? styles.statusError : ''}`}
        >
          {message}
        </div>
      )}

      <p className={styles.formFooter}>
        Los campos marcados con * son obligatorios. Su información será tratada con confidencialidad y usada exclusivamente para responder su solicitud.
      </p>
    </form>
  );
}
