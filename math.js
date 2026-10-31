/* Keep catalog values plain for search and CSV; typeset only their display. */
(() => {
  const symbols = {
    'Reδ₀': String.raw`Re_{\delta_0}`, 'Reλ': String.raw`Re_{\lambda}`,
    'Reτ': String.raw`Re_{\tau}`, 'Weτ': String.raw`We_{\tau}`,
    'Weₗ': String.raw`We_l`, 'ρd/ρc': String.raw`\rho_d/\rho_c`,
    'μd/μc': String.raw`\mu_d/\mu_c`, 'ρg/ρl': String.raw`\rho_g/\rho_l`,
    'μg/μl': String.raw`\mu_g/\mu_l`, 'ρ₁/ρ₂': String.raw`\rho_1/\rho_2`,
    'μ₁/μ₂': String.raw`\mu_1/\mu_2`, 'd′b': String.raw`d'_b`,
    'd′t': String.raw`d'_t`, 'ϕ': String.raw`\phi`
  };
  const pattern = /u, v, w, p, ϕ|Reδ₀|Reλ|Reτ|Weτ|Weₗ|ρd\/ρc|μd\/μc|ρg\/ρl|μg\/μl|ρ₁\/ρ₂|μ₁\/μ₂|d′b|d′t|\d+³(?:–\d+³)?|\d+(?:\.\d+)?(?:–\d+(?:\.\d+)?)? × 10⁴|ϕ|\bRe\b|\bWe\b/g;
  function tex(value) {
    if (value === 'u, v, w, p, ϕ') return String.raw`u,\;v,\;w,\;p,\;\phi`;
    if (symbols[value]) return symbols[value];
    return value.replaceAll('³', '^{3}').replaceAll('⁴', '^{4}')
      .replaceAll('×', String.raw`\times`).replaceAll('–', String.raw`\text{–}`);
  }
  window.renderScientificMath = (root = document.body) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (node.parentElement.closest('script,style,textarea,input,svg,mjx-container,.scientific-math')) return NodeFilter.FILTER_REJECT;
        pattern.lastIndex = 0;
        return pattern.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const fragment = document.createDocumentFragment(); let start = 0;
      pattern.lastIndex = 0;
      for (const match of node.nodeValue.matchAll(pattern)) {
        fragment.append(node.nodeValue.slice(start, match.index));
        const span = document.createElement('span');
        span.className = 'scientific-math'; span.dataset.tex = tex(match[0]);
        span.textContent = match[0]; fragment.append(span);
        start = match.index + match[0].length;
      }
      fragment.append(node.nodeValue.slice(start)); node.replaceWith(fragment);
    }
    if (!window.MathJax?.tex2chtmlPromise) return;
    root.querySelectorAll('.scientific-math:not([data-rendering])').forEach(span => {
      span.dataset.rendering = 'true';
      MathJax.tex2chtmlPromise(span.dataset.tex, {display: false}).then(math => {
        if (span.isConnected) span.replaceChildren(math);
      }).catch(error => { delete span.dataset.rendering; console.warn('Math rendering unavailable; retaining text.', error); });
    });
  };
  window.MathJax = {
    startup: {
      typeset: false,
      pageReady: () => MathJax.startup.defaultPageReady().then(() => window.renderScientificMath())
    }
  };
})();
