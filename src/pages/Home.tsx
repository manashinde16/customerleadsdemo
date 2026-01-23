import { NitroFormEmbed } from '../components/NitroFormEmbed';

export function Home() {
  // TODO: Replace with actual form ID from Nitro
  const formId = 'form_1769156723908_ztrcpgleo';

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Worsell Customer Demo</h1>
        <p>This page loads a Nitro-hosted form</p>
      </header>

      <section style={{ marginTop: '2rem' }}>
        <h2>Contact Form</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Fill out the form below to get in touch with us.
        </p>
        <NitroFormEmbed formId={formId} />
      </section>

      <section style={{ marginTop: '3rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Embed Code</h3>
        <pre style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
          {`<div data-nitro-form="${formId}"></div>
<script src="/embed.js"></script>`}
        </pre>
      </section>
    </div>
  );
}
