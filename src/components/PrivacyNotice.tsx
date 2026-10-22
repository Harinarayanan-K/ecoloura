import { track } from '../lib/analytics';
import { contactEmail } from '../lib/contact';
export function PrivacyNotice() {
  return <article className="section-shell privacy-notice"><span className="eyebrow">ECOLOURÀ</span><h1>Enquiry privacy notice</h1>
    <p>When you enquire, Ecolourà uses your contact details, property name, location and product requirements to respond, prepare a quotation and discuss supply. Please do not include guest information, payment details or sensitive personal information.</p>
    <h2>How your enquiry is handled</h2><p>Online form submissions, when enabled, are sent through our email delivery provider, Resend, to the business inbox. Acceptance by the email service is not confirmation of inbox delivery or an order. Delivery failures keep your details on screen so you can retry or contact us directly.</p>
    <p>Continuing in WhatsApp opens a message for you to send. WhatsApp handles messages under its own privacy terms. Telephone and email links open your chosen apps. The AI assistant sends the messages you type to Groq to generate a response; avoid sharing confidential information in the assistant.</p>
    <h2>Optional analytics</h2><p>If configured and you allow analytics, Google Analytics or Google Tag Manager measures page visits and contact actions. Our custom events contain the page path, button source and product name where relevant. They do not include form fields or message text. Advertising storage, advertising user data and personalized advertising are denied by this site's consent settings. You can change your choice using Analytics preferences in the footer. Your choice is stored in this browser.</p>
    <h2>Questions and requests</h2><p>Contact <a href={`mailto:${contactEmail}`} onClick={() => track('email_click', 'privacy_notice')}>{contactEmail}</a> about your enquiry or personal information, including requests to correct or delete your details. Contact details supplied in an enquiry are used to respond to that enquiry; the form does not sign you up for marketing.</p>
  </article>;
}
