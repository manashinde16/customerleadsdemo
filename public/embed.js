(function () {
  var SUPABASE_URL = 'https://teahoabahmdvxxqwpnkq.supabase.co/rest/v1';
  var SUPABASE_KEY = 'sb_publishable_Si6ArCacA9XFcTIGtpSc_g_0vA2C9kN';
  var HEADERS = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + SUPABASE_KEY,
  };

  function isAllowedDomain(form) {
    if (!form.allowed_domains || !form.allowed_domains.trim()) return true;
    var currentHost = window.location.hostname;
    var allowed = form.allowed_domains.split(',').map(function (d) {
      return d.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    });
    return allowed.some(function (d) {
      return d === currentHost || d === 'localhost';
    });
  }

  function fetchForm(formId, callback) {
    fetch(SUPABASE_URL + '/forms?id=eq.' + formId + '&status=eq.published&select=*', {
      headers: HEADERS,
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var form = data && data[0];
        if (!form) { callback(null, null); return; }
        if (!isAllowedDomain(form)) { callback(new Error('Domain not allowed'), null); return; }
        callback(null, form);
      })
      .catch(function (err) { callback(err, null); });
  }

  function submitForm(formId, data, callback) {
    var originDomain = window.location.hostname;
    fetch(SUPABASE_URL + '/form_submissions', {
      method: 'POST',
      headers: Object.assign({}, HEADERS, { Prefer: 'return=minimal' }),
      body: JSON.stringify({
        form_id: formId,
        data: data,
        origin_domain: originDomain,
        submitted_at: new Date().toISOString(),
      }),
    })
      .then(function (r) {
        if (r.ok) callback(null);
        else r.text().then(function (t) { callback(new Error(t)); });
      })
      .catch(callback);
  }

  function renderForm(container, form) {
    var formId = container.getAttribute('data-nitro-form');
    container.innerHTML = '';

    var title = document.createElement('h3');
    title.textContent = form.title;
    title.style.cssText = 'margin:0 0 16px;font-size:18px;font-weight:600;';
    container.appendChild(title);

    var formEl = document.createElement('form');
    formEl.style.cssText = 'display:flex;flex-direction:column;gap:14px;';

    var inputs = {};
    (form.fields || []).forEach(function (field) {
      var wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;flex-direction:column;gap:4px;';

      var label = document.createElement('label');
      label.style.cssText = 'font-size:14px;font-weight:500;';
      label.textContent = field.label + (field.required ? ' *' : '');

      var input;
      if (field.type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 3;
        input.style.cssText =
          'padding:8px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;resize:vertical;font-family:inherit;width:100%;box-sizing:border-box;';
      } else {
        input = document.createElement('input');
        input.type = field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text';
        input.style.cssText =
          'padding:8px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;height:38px;width:100%;box-sizing:border-box;outline:none;';
      }
      input.required = field.required;

      inputs[field.label] = input;
      wrapper.appendChild(label);
      wrapper.appendChild(input);
      formEl.appendChild(wrapper);
    });

    var submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Submit';
    submitBtn.style.cssText =
      'margin-top:8px;padding:10px;background:#1677ff;color:#fff;border:none;border-radius:6px;font-size:15px;cursor:pointer;width:100%;';

    var successMsg = document.createElement('div');
    successMsg.style.cssText =
      'display:none;padding:12px;background:#f6ffed;border:1px solid #b7eb8f;border-radius:6px;color:#389e0d;font-size:14px;margin-top:8px;';
    successMsg.textContent = 'Form submitted successfully!';

    var errorMsg = document.createElement('div');
    errorMsg.style.cssText =
      'display:none;padding:12px;background:#fff2f0;border:1px solid #ffccc7;border-radius:6px;color:#cf1322;font-size:14px;margin-top:8px;';

    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      (form.fields || []).forEach(function (field) {
        data[field.label] = inputs[field.label] ? inputs[field.label].value : '';
      });
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      submitForm(formId, data, function (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
        if (err) {
          errorMsg.style.display = 'block';
          errorMsg.textContent = 'Submission failed. Please try again.';
          successMsg.style.display = 'none';
        } else {
          successMsg.style.display = 'block';
          errorMsg.style.display = 'none';
          formEl.reset();
        }
      });
    });

    formEl.appendChild(submitBtn);
    container.appendChild(formEl);
    container.appendChild(successMsg);
    container.appendChild(errorMsg);
  }

  function initContainer(container) {
    var formId = container.getAttribute('data-nitro-form');
    if (!formId) return;
    container.innerHTML = '<p style="color:#888;font-size:14px;">Loading form...</p>';
    fetchForm(formId, function (err, form) {
      if (err || !form) {
        container.innerHTML =
          '<p style="color:#cf1322;font-size:14px;">Form not found or not published.</p>';
        return;
      }
      renderForm(container, form);
    });
  }

  function init() {
    document.querySelectorAll('[data-nitro-form]').forEach(initContainer);

    // Watch for dynamically added form containers
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            if (node.hasAttribute && node.hasAttribute('data-nitro-form')) {
              initContainer(node);
            }
            if (node.querySelectorAll) {
              node.querySelectorAll('[data-nitro-form]').forEach(initContainer);
            }
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
