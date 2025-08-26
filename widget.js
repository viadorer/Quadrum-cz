// Simple loader for ECM contact form widget
// Usage: add a container with data-ecm-widget-id="<WIDGET_ID>"
// Example: <div class="contact-form" data-ecm-widget-id="25-f17c94ba9f7a7a06b025a1afaaca6e6a"></div>
(function () {
  const WIDGET_SRC = 'https://d70shl7vidtft.cloudfront.net/widget.js';
  const GLOBAL_FN = 'ecmwidget';

  function ensureScriptLoaded() {
    return new Promise((resolve) => {
      if (window[GLOBAL_FN]) return resolve();
      // Create stub to queue calls until script loads
      window['ecm-widget'] = GLOBAL_FN;
      window[GLOBAL_FN] = window[GLOBAL_FN] || function () {
        (window[GLOBAL_FN].q = window[GLOBAL_FN].q || []).push(arguments);
      };
      const js = document.createElement('script');
      js.async = 1;
      js.src = WIDGET_SRC;
      js.onload = () => resolve();
      document.head.appendChild(js);
    });
  }

  function initContainer(container) {
    const widgetId = container.getAttribute('data-ecm-widget-id');
    if (!widgetId) return;

    // Avoid duplicate init
    if (container.dataset.ecmInited) return;
    container.dataset.ecmInited = 'true';

    // Create inner target element id="f-<id>"
    const targetId = `f-${widgetId}`;
    let target = container.querySelector(`#${CSS.escape(targetId)}`);
    if (!target) {
      target = document.createElement('div');
      target.id = targetId;
      container.appendChild(target);
    }

    // Load the widget script and let it render into target
    ensureScriptLoaded().then(() => {
      // Some widgets auto-render by presence of target element id, others need explicit call.
      // If explicit call is needed, uncomment and adjust:
      // window[GLOBAL_FN]('render', { id: widgetId, target: `#${targetId}` });
    });
  }

  function initAll() {
    document.querySelectorAll('[data-ecm-widget-id]').forEach(initContainer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
