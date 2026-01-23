import { useEffect, useRef } from 'react';

interface NitroFormEmbedProps {
  formId: string;
}

/**
 * Component that loads the embed.js script and initializes form embedding
 */
export function NitroFormEmbed({ formId }: NitroFormEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create the container div with data attribute
    if (containerRef.current) {
      containerRef.current.setAttribute('data-nitro-form', formId);
    }

    // Load embed.js script if not already loaded
    const existingScript = document.querySelector('script[src="/embed.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = '/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Cleanup is handled by the embed.js script itself
  }, [formId]);

  return <div ref={containerRef} id={`nitro-form-${formId}`} />;
}
