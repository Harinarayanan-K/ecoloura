import { defaultWhatsAppMessage, whatsappUrl } from '../lib/contact';
import { track } from '../lib/analytics';
import type { ReactNode } from 'react';
export function WhatsAppLink({ source, product, className = '', children }: { source: string; product?: string; className?: string; children: ReactNode }) {
  const url = whatsappUrl(defaultWhatsAppMessage(product));
  const label = product ? `Enquire about ${product} on WhatsApp` : 'Enquire on WhatsApp';
  if (!url) return <span className={className}>WhatsApp unavailable — please call or email</span>;
  return <a className={className} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} onClick={() => track('whatsapp_click', source, product)}>{children}</a>;
}
