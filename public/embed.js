/**
 * Nitro Form Embed Widget
 * 
 * Version: 2.0 - Fixed submission payload format
 * 
 * This script:
 * 1. Detects <div data-nitro-form="FORM_ID"> elements
 * 2. Fetches form schema from Nitro API
 * 3. Renders form dynamically
 * 4. Handles form submission with correct payload format
 */

(function() {
  'use strict';

  const NITRO_BASE_URL = 'http://localhost:8000';
  
  // Version for cache busting
  console.log('[Nitro Embed] Widget loaded - Version 2.0');

  /**
   * Get current domain for allowlist validation
   * Returns hostname (without port) for matching
   */
  function getCurrentDomain() {
    return window.location.hostname;
  }

  /**
   * Get current origin (hostname + port) for debugging
   */
  function getCurrentOrigin() {
    return window.location.host; // includes port if present
  }

  /**
   * Fetch form schema from Nitro API
   */
  async function fetchFormSchema(formId) {
    try {
      const response = await fetch(`${NITRO_BASE_URL}/api/forms/${formId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch form: ${response.statusText}`);
      }

      const formData = await response.json();
      return formData;
    } catch (error) {
      console.error('Error fetching form schema:', error);
      throw error;
    }
  }

  /**
   * Validate domain allowlist
   */
  function validateDomain(formData, currentDomain) {
    if (!formData.allowedDomains || formData.allowedDomains.length === 0) {
      return true; // No restrictions
    }

    // Normalize current domain (remove port if present, lowercase)
    const normalizedCurrent = currentDomain.toLowerCase().split(':')[0];

    // Check exact match or subdomain
    return formData.allowedDomains.some(allowed => {
      // Normalize allowed domain (remove port if present, lowercase)
      const normalizedAllowed = allowed.toLowerCase().split(':')[0];
      
      // Exact match
      if (normalizedCurrent === normalizedAllowed) {
        return true;
      }
      
      // Subdomain match (e.g., app.example.com matches example.com)
      if (normalizedCurrent.endsWith('.' + normalizedAllowed)) {
        return true;
      }
      
      // Special case: localhost variations
      if (normalizedAllowed === 'localhost' && normalizedCurrent === 'localhost') {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Render form fields dynamically
   */
  function renderForm(container, formData) {
    const form = document.createElement('form');
    form.className = 'nitro-form';
    form.id = `nitro-form-${formData.id}`;
    
    // Store field metadata for submission (maps input name to original label)
    const fieldMetadata = {};

    // Add form title
    if (formData.title) {
      const title = document.createElement('h2');
      title.textContent = formData.title;
      title.style.marginBottom = '1.5rem';
      form.appendChild(title);
    }

    // Render fields
    formData.fields.forEach((field, index) => {
      const fieldWrapper = document.createElement('div');
      fieldWrapper.className = 'nitro-field';
      fieldWrapper.style.marginBottom = '1rem';

      const label = document.createElement('label');
      label.textContent = field.label + (field.required ? ' *' : '');
      label.style.display = 'block';
      label.style.marginBottom = '0.5rem';
      label.style.fontWeight = '500';
      label.setAttribute('for', `field-${index}`);

      let input;

      if (field.type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 4;
      } else {
        input = document.createElement('input');
        input.type = field.type;
      }

      // Use normalized name for input (for form handling)
      const inputName = field.label.toLowerCase().replace(/\s+/g, '_');
      input.id = `field-${index}`;
      input.name = inputName;
      input.required = field.required;
      // Store original label as data attribute (backup for submission)
      input.setAttribute('data-original-label', field.label);
      input.style.width = '100%';
      input.style.padding = '0.75rem';
      input.style.border = '1px solid #ddd';
      input.style.borderRadius = '4px';
      input.style.fontSize = '1rem';
      
      // Store mapping: input name -> original field label (for submission)
      fieldMetadata[inputName] = field.label;

      fieldWrapper.appendChild(label);
      fieldWrapper.appendChild(input);
      form.appendChild(fieldWrapper);
    });
    
    // Store field metadata on form element for submission handler
    form._fieldMetadata = fieldMetadata;
    form._formData = formData;

    // Submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Submit';
    submitButton.style.width = '100%';
    submitButton.style.padding = '0.75rem';
    submitButton.style.backgroundColor = '#007bff';
    submitButton.style.color = 'white';
    submitButton.style.border = 'none';
    submitButton.style.borderRadius = '4px';
    submitButton.style.fontSize = '1rem';
    submitButton.style.cursor = 'pointer';
    submitButton.style.marginTop = '1rem';

    submitButton.addEventListener('mouseenter', () => {
      submitButton.style.backgroundColor = '#0056b3';
    });

    submitButton.addEventListener('mouseleave', () => {
      submitButton.style.backgroundColor = '#007bff';
    });

    form.appendChild(submitButton);

    // Loading state
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'nitro-loading';
    loadingDiv.style.display = 'none';
    loadingDiv.textContent = 'Loading form...';
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.padding = '2rem';

    // Error state
    const errorDiv = document.createElement('div');
    errorDiv.className = 'nitro-error';
    errorDiv.style.display = 'none';
    errorDiv.style.color = '#dc3545';
    errorDiv.style.padding = '1rem';
    errorDiv.style.backgroundColor = '#f8d7da';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.marginTop = '1rem';

    // Success state
    const successDiv = document.createElement('div');
    successDiv.className = 'nitro-success';
    successDiv.style.display = 'none';
    successDiv.style.color = '#155724';
    successDiv.style.padding = '1rem';
    successDiv.style.backgroundColor = '#d4edda';
    successDiv.style.borderRadius = '4px';
    successDiv.style.marginTop = '1rem';
    successDiv.textContent = 'Form submitted successfully!';

    container.appendChild(loadingDiv);
    container.appendChild(form);
    container.appendChild(errorDiv);
    container.appendChild(successDiv);

    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Hide previous messages
      errorDiv.style.display = 'none';
      successDiv.style.display = 'none';

      // Disable submit button
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
      submitButton.style.opacity = '0.6';

      try {
        // Get field metadata and form data from form element
        const fieldMetadata = form._fieldMetadata || {};
        const formSchema = form._formData || formData;
        
        // Collect form data and map to original field labels
        const formDataObj = new FormData(form);
        const submissionDataObj = {};
        
        // Map input names back to original field labels
        // CRITICAL: Must use EXACT field labels from form schema (case-sensitive, whitespace-sensitive)
        formDataObj.forEach((value, inputName) => {
          let fieldLabel = null;
          
          // Method 1: From fieldMetadata (most reliable - set during form rendering)
          if (fieldMetadata[inputName]) {
            fieldLabel = fieldMetadata[inputName];
            console.log(`[Nitro Embed] Found label from metadata: ${inputName} -> ${fieldLabel}`);
          }
          
          // Method 2: Match against form schema fields (use exact label from schema)
          if (!fieldLabel && formSchema.fields) {
            const matchingField = formSchema.fields.find(field => {
              const normalizedFieldName = field.label.toLowerCase().replace(/\s+/g, '_');
              return normalizedFieldName === inputName;
            });
            if (matchingField) {
              fieldLabel = matchingField.label; // Use EXACT label from schema
              console.log(`[Nitro Embed] Found label from schema: ${inputName} -> ${fieldLabel}`);
            }
          }
          
          // Method 3: From data attribute on input element
          if (!fieldLabel) {
            const inputElement = form.querySelector(`[name="${inputName}"]`);
            if (inputElement) {
              fieldLabel = inputElement.getAttribute('data-original-label');
              if (fieldLabel) {
                console.log(`[Nitro Embed] Found label from data attribute: ${inputName} -> ${fieldLabel}`);
              }
            }
          }
          
          // Final fallback: capitalize first letter of each word (should not happen if metadata is set)
          if (!fieldLabel) {
            fieldLabel = inputName
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            console.warn(`[Nitro Embed] Using fallback label mapping: ${inputName} -> ${fieldLabel}`);
          }
          
          // Store with exact label
          submissionDataObj[fieldLabel] = value;
        });

        // Get current origin (hostname + port) for originDomain
        const originDomain = getCurrentOrigin();
        
        // Build payload matching Nitro API contract
        // The server expects fields at top level AND in data wrapper
        // Structure: { Name: "...", Email: "...", data: { Name: "...", Email: "..." }, originDomain: "..." }
        const payload = {
          ...submissionDataObj, // Include fields at top level (server validates here)
          data: submissionDataObj, // Also include in data wrapper (per blueprint)
          originDomain: originDomain
        };

        // Log submission (reduced logging for production)
        console.log('[Nitro Embed] Submitting form:', {
          formId: formSchema.id,
          endpoint: `${NITRO_BASE_URL}/api/forms/${formSchema.id}/submit`
        });

        // Submit to Nitro API
        const response = await fetch(
          `${NITRO_BASE_URL}/api/forms/${formSchema.id}/submit`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Origin': window.location.origin
            },
            body: JSON.stringify(payload),
          }
        );

        // Parse response body for better error messages
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            responseData = await response.json();
            if (!response.ok) {
              console.error('[Nitro Embed] Submission failed:', responseData);
            } else {
              console.log('[Nitro Embed] Submission successful!', responseData);
            }
          } catch (parseError) {
            console.warn('[Nitro Embed] Could not parse response as JSON:', parseError);
          }
        }

        if (!response.ok) {
          const errorMessage = responseData?.message || responseData?.error || response.statusText || 'Submission failed';
          const errorDetails = responseData?.details ? ` (${JSON.stringify(responseData.details)})` : '';
          throw new Error(`${errorMessage}${errorDetails}`);
        }

        // Success message already logged above

        // Show success
        form.style.display = 'none';
        successDiv.style.display = 'block';
      } catch (error) {
        console.error('[Nitro Embed] Error submitting form:', error);
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
        submitButton.style.opacity = '1';
      }
    });

    return form;
  }

  /**
   * Normalize form data response (handle nested structures)
   */
  function normalizeFormData(response) {
    // If response is wrapped in data or form property, unwrap it
    if (response.data && typeof response.data === 'object') {
      return response.data;
    }
    if (response.form && typeof response.form === 'object') {
      return response.form;
    }
    // Otherwise return as-is
    return response;
  }

  /**
   * Check if form is published (robust comparison)
   */
  function isFormPublished(formData) {
    // Handle different response structures
    let status = formData.status;
    
    // If status is nested, try to find it
    if (!status && formData.data) {
      status = formData.data.status;
    }
    if (!status && formData.form) {
      status = formData.form.status;
    }
    
    // Normalize status: trim whitespace and convert to lowercase
    if (typeof status === 'string') {
      status = status.trim().toLowerCase();
    }
    
    // Log for debugging
    console.log('[Nitro Embed] Form status check:', {
      rawStatus: formData.status,
      normalizedStatus: status,
      fullResponse: formData
    });
    
    return status === 'published';
  }

  /**
   * Initialize form for a container element
   */
  async function initializeForm(container) {
    const formId = container.getAttribute('data-nitro-form');
    if (!formId) {
      console.error('[Nitro Embed] No form ID found in data-nitro-form attribute');
      return;
    }

    // Show loading state
    container.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading form...</div>';

    try {
      // Fetch form schema
      const rawResponse = await fetchFormSchema(formId);
      
      // Normalize response structure (handle nested data/form properties)
      const formData = normalizeFormData(rawResponse);
      
      // Log the full response for debugging
      console.log('[Nitro Embed] Raw response:', rawResponse);
      console.log('[Nitro Embed] Normalized form data:', formData);
      console.log('[Nitro Embed] Form status:', formData.status);
      console.log('[Nitro Embed] Form fields:', formData.fields);
      console.log('[Nitro Embed] Allowed domains:', formData.allowedDomains);

      // Validate form is published (robust check)
      if (!isFormPublished(formData)) {
        console.warn('[Nitro Embed] Form is not published. Status:', formData.status);
        container.innerHTML = `
          <div style="color: #dc3545; padding: 1rem; background-color: #f8d7da; border-radius: 4px;">
            This form is not published yet. (Status: ${formData.status || 'unknown'})
          </div>
        `;
        return;
      }

      // Validate domain allowlist
      const currentDomain = getCurrentDomain();
      const currentOrigin = getCurrentOrigin();
      console.log('[Nitro Embed] Current domain:', currentDomain);
      console.log('[Nitro Embed] Current origin:', currentOrigin);
      console.log('[Nitro Embed] Allowed domains:', formData.allowedDomains);
      
      if (!validateDomain(formData, currentDomain)) {
        console.warn('[Nitro Embed] Domain validation failed');
        container.innerHTML = `
          <div style="color: #dc3545; padding: 1rem; background-color: #f8d7da; border-radius: 4px;">
            This form cannot be embedded on this domain. (Current: ${currentDomain})
          </div>
        `;
        return;
      }

      // Validate fields exist
      if (!formData.fields || !Array.isArray(formData.fields) || formData.fields.length === 0) {
        console.warn('[Nitro Embed] Form has no fields');
        container.innerHTML = `
          <div style="color: #dc3545; padding: 1rem; background-color: #f8d7da; border-radius: 4px;">
            This form has no fields configured.
          </div>
        `;
        return;
      }

      console.log('[Nitro Embed] All validations passed. Rendering form...');

      // Clear container and render form
      container.innerHTML = '';
      renderForm(container, formData);
    } catch (error) {
      console.error('[Nitro Embed] Error initializing form:', error);
      container.innerHTML = `
        <div style="color: #dc3545; padding: 1rem; background-color: #f8d7da; border-radius: 4px;">
          Error loading form: ${error.message}
        </div>
      `;
    }
  }

  /**
   * Initialize all forms on page load
   */
  function init() {
    // Find all containers with data-nitro-form attribute
    const containers = document.querySelectorAll('[data-nitro-form]');

    containers.forEach((container) => {
      initializeForm(container);
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also handle dynamically added forms
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          // Element node
          if (node.hasAttribute && node.hasAttribute('data-nitro-form')) {
            initializeForm(node);
          }
          // Check children
          const containers = node.querySelectorAll
            ? node.querySelectorAll('[data-nitro-form]')
            : [];
          containers.forEach((container) => {
            initializeForm(container);
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
