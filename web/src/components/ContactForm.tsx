import { useState } from 'react';

const STRAPI_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_STRAPI_URL) ||
  'http://localhost:1337';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface FormErrors {
  nombre?: string;
  email?: string;
  asunto?: string;
  mensaje?: string;
  consentimiento?: string;
  captcha?: string;
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
  const [captchaChecked, setCaptchaChecked] = useState(false);
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
    if (!captchaChecked) e.captcha = 'Complete la verificación anti-spam.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    // Honeypot: si está lleno, es bot → simular éxito sin enviar
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
      // Reset form except consent?
      setNombre('');
      setEmail('');
      setAsunto('');
      setMensaje('');
      setConsentimiento(false);
      setCaptchaChecked(false);
      setErrors({});
    } catch (err: any) {
      console.error('[ContactForm] fetch error', err);
      // Detect CORS/network
      const msg = err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')
        ? 'No se pudo conectar con el servidor. Verifique su conexión o intente más tarde. (CORS: asegúrese de que Strapi permita el origen)'
        : err?.message || 'Ocurrió un error al enviar el mensaje. Intente nuevamente.';
      setStatus('error');
      setMessage(msg);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="form"
      aria-label="Formulario de contacto"
      style={{ position: 'relative' }}
    >
      {/* Honeypot oculto */}
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

      <div className="field">
        <label htmlFor="contact-nombre">Nombre completo *</label>
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
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: María Pérez"
        />
        {errors.nombre && (
          <span id="err-contact-nombre" role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>
            {errors.nombre}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="contact-email">Correo electrónico *</label>
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@correo.com"
        />
        {errors.email && (
          <span id="err-contact-email" role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>
            {errors.email}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="contact-asunto">Asunto *</label>
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
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Ej: Consulta académica"
        />
        {errors.asunto && (
          <span id="err-contact-asunto" role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>
            {errors.asunto}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="contact-mensaje">Mensaje *</label>
        <textarea
          id="contact-mensaje"
          name="mensaje"
          rows={6}
          required
          autoComplete="off"
          aria-label="Mensaje"
          aria-required="true"
          aria-invalid={!!errors.mensaje}
          aria-describedby={errors.mensaje ? 'err-contact-mensaje' : undefined}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Describa su consulta con el mayor detalle posible..."
        />
        {errors.mensaje && (
          <span id="err-contact-mensaje" role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>
            {errors.mensaje}
          </span>
        )}
      </div>

      {/* Captcha placeholder */}
      <div
        className="field"
        style={{
          border: '1px solid var(--line)',
          padding: '0.9rem 1rem',
          background: 'var(--wash)',
          borderRadius: '6px',
        }}
      >
        <label
          htmlFor="contact-captcha"
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600 }}
        >
          <input
            id="contact-captcha"
            type="checkbox"
            checked={captchaChecked}
            onChange={(e) => setCaptchaChecked(e.target.checked)}
            aria-label="Verificación anti-spam, no soy un robot"
            style={{ width: '18px', height: '18px' }}
          />
          <span>No soy un robot (verificación anti-spam placeholder)</span>
        </label>
        <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', margin: '0.4rem 0 0', lineHeight: 1.5 }}>
          * Este es un placeholder. En producción se integrará reCAPTCHA / hCaptcha / Cloudflare Turnstile.
        </p>
        {errors.captcha && (
          <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>
            {errors.captcha}
          </span>
        )}
      </div>

      {/* Consentimiento + aviso privacidad */}
      <div className="field">
        <label
          htmlFor="contact-consentimiento"
          style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer', fontWeight: 500, lineHeight: 1.6 }}
        >
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
            style={{ marginTop: '0.3rem', width: '18px', height: '18px' }}
          />
          <span>
            Autorizo el tratamiento de mis datos personales conforme a la{' '}
            <a href="/manual-convivencia" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}>
              política de privacidad
            </a>{' '}
            y la Ley 1581 de 2012. *
          </span>
        </label>
        {errors.consentimiento && (
          <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>
            {errors.consentimiento}
          </span>
        )}
      </div>

      <button
        className="submit"
        type="submit"
        disabled={status === 'loading'}
        aria-busy={status === 'loading'}
        aria-label={status === 'loading' ? 'Enviando mensaje' : 'Enviar mensaje'}
        style={{ opacity: status === 'loading' ? 0.7 : 1 }}
      >
        {status === 'loading' ? 'Enviando…' : 'Enviar'}
      </button>

      {message && (
        <div
          role={status === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          style={{
            padding: '0.9rem 1rem',
            border: `1px solid ${status === 'success' ? 'var(--primary)' : status === 'error' ? 'var(--destructive)' : 'var(--line)'}`,
            background: status === 'success' ? 'var(--primary-wash)' : status === 'error' ? '#fef2f2' : 'var(--wash)',
            color: status === 'error' ? 'var(--destructive)' : 'var(--ink)',
            lineHeight: 1.6,
            fontSize: '0.92rem',
          }}
        >
          {message}
        </div>
      )}

      <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', lineHeight: 1.6, margin: 0 }}>
        Los campos marcados con * son obligatorios. Su información será tratada con confidencialidad y usada exclusivamente para responder su solicitud.
      </p>
    </form>
  );
}
