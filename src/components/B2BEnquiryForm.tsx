import { useRef, useState } from 'react';
import { productsData } from '../data/productsData';
import { districts, enquiryText, validateEnquiry, type Enquiry } from '../leads/validation';
import { track } from '../lib/analytics';
import { whatsappUrl, contactEmail, contactPhone } from '../lib/contact';

export function B2BEnquiryForm({ initialProduct = '' }: { initialProduct?: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const status = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const request = useRef<{ fingerprint: string; id: string } | null>(null);
  const enabled = import.meta.env.VITE_ENQUIRY_FORM_ENABLED === 'true';
  const read = (form: HTMLFormElement): Enquiry => {
    const values = new FormData(form);
    const text = (name: string) => String(values.get(name) || '');
    return { property: text('property'), name: text('name'), email: text('email'), phone: text('phone'), city: text('city'), district: text('district'), products: values.getAll('products').map(String), quantity: text('quantity'), requirements: text('requirements'), consent: values.get('consent') === 'on', website: text('website') };
  };
  const validated = (form: HTMLFormElement) => {
    const result = validateEnquiry(read(form)); setErrors(result.errors);
    if (!result.data) {
      setMessage('Please check the highlighted fields.'); setState('error');
      requestAnimationFrame(() => { form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(); });
    }
    return result.data;
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending.current || !enabled || state === 'success') return;
    const data = validated(event.currentTarget); if (!data) return;
    const fingerprint = JSON.stringify(data);
    if (request.current?.fingerprint !== fingerprint) request.current = { fingerprint, id: crypto.randomUUID() };
    pending.current = true; setState('sending'); setMessage('Sending your quotation request…');
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, requestId: request.current.id }), signal: controller.signal });
      const result = await response.json();
      if (!response.ok || !result.submissionId) { if (result.errors) setErrors(result.errors); throw new Error('Delivery not confirmed'); }
      setState('success'); setMessage('Your quotation request was accepted by our email service for delivery to Ecolourà. This is not an order confirmation.');
      track('enquiry_submitted', 'quotation_form', undefined, result.submissionId);
    } catch {
      setState('error'); setMessage('We could not confirm delivery. Your details are still here. Please retry, continue in WhatsApp, call or email us.');
    } finally { clearTimeout(timer); pending.current = false; requestAnimationFrame(() => status.current?.focus()); }
  };
  const error = (key: string) => errors[key] ? <small className="field-error" id={`error-${key}`}>{errors[key]}</small> : null;
  const invalid = (key: string) => ({ 'aria-invalid': !!errors[key], 'aria-describedby': errors[key] ? `error-${key}` : undefined });
  return <form className="b2b-form" method="post" action="/api/enquiry" noValidate onSubmit={submit}>
    <noscript><p>Online submission requires JavaScript. Please use the WhatsApp links on this page, <a href={`tel:${contactPhone}`} onClick={() => track('telephone_click', 'quotation_form')}>telephone</a> or <a href={`mailto:${contactEmail}`} onClick={() => track('email_click', 'quotation_form')}>email</a>.</p><style>{`.b2b-form button{display:none}`}</style></noscript>
    {!enabled && <p className="form-setup-note">Online form delivery is not enabled yet. You can prepare your details below and continue in WhatsApp, or <a href={`tel:${contactPhone}`} onClick={() => track('telephone_click', 'quotation_form')}>call</a> / <a href={`mailto:${contactEmail}`} onClick={() => track('email_click', 'quotation_form')}>email our team</a>.</p>}
    <div className="form-pair"><label>Hotel or resort name<input name="property" autoComplete="organization" required maxLength={150} {...invalid('property')} />{error('property')}</label><label>Contact person’s name<input name="name" autoComplete="name" required maxLength={100} {...invalid('name')} />{error('name')}</label></div>
    <div className="form-pair"><label>Business email<input name="email" type="email" autoComplete="email" required maxLength={254} {...invalid('email')} />{error('email')}</label><label>Phone or WhatsApp number<input name="phone" type="tel" autoComplete="tel" placeholder="Include country code" required maxLength={25} {...invalid('phone')} />{error('phone')}</label></div>
    <div className="form-pair"><label>City in Kerala<input name="city" autoComplete="address-level2" required maxLength={100} {...invalid('city')} />{error('city')}</label><label>District in Kerala<select name="district" required defaultValue="" {...invalid('district')}><option value="" disabled>Select district</option>{districts.map(d => <option key={d}>{d}</option>)}</select>{error('district')}</label></div>
    <fieldset aria-describedby={errors.products ? 'error-products' : undefined}><legend>Products of interest (select at least one)</legend><div className="product-options">{productsData.map(p => <label className="check-label" key={p.id}><input type="checkbox" name="products" value={p.id} defaultChecked={initialProduct === p.name} {...invalid('products')} />{p.name}</label>)}</div>{error('products')}</fieldset>
    <label>Estimated quantity or order size (optional)<input name="quantity" maxLength={100} placeholder="Product quantities, if known" {...invalid('quantity')} />{error('quantity')}</label>
    <label>Additional requirements (optional)<textarea name="requirements" maxLength={1500} rows={3} placeholder="Logo, packaging or other requirements" {...invalid('requirements')} />{error('requirements')}</label>
    <div className="form-honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="check-label"><input name="consent" type="checkbox" required {...invalid('consent')} /><span>I agree that Ecolourà may use these details to respond to this enquiry. <a href="/privacy/" target="_blank" rel="noopener noreferrer">Privacy notice</a>.</span></label>{error('consent')}
    <div className="inquiry-submit-options"><button className="premium-button" disabled={!enabled || state === 'sending' || state === 'success'} type="submit">{state === 'sending' ? 'Sending…' : state === 'success' ? 'Request accepted' : 'Send quotation request'}</button>
      <button className="inquiry-whatsapp-button" aria-label="Continue with these details in WhatsApp" title="Continue with these details in WhatsApp" type="button" disabled={state === 'sending'} onClick={e => {
        const data = validated(e.currentTarget.form!); if (!data) return;
        const url = whatsappUrl(enquiryText(data));
        if (!url) { setState('error'); setMessage('WhatsApp is unavailable. Please call or email our team.'); return; }
        window.open(url, '_blank', 'noopener,noreferrer'); track('whatsapp_click', 'quotation_form');
        if (state !== 'success') { setState('idle'); setMessage('Your message is ready in WhatsApp. Press Send there to contact Ecolourà. No online form submission was made.'); }
      }}>Continue with these details in WhatsApp</button>
    </div>
    <small>WhatsApp opens a prepared message. You must press Send there; opening it does not submit this form.</small>
    <div ref={status} tabIndex={-1} role={state === 'error' ? 'alert' : 'status'} aria-live="polite" className={`form-status ${state}`}>{message}</div>
  </form>;
}
