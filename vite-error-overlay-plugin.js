class ErrorOverlay {
  static MESSAGE_TITLE = `We're having trouble displaying this page`;
  static MESSAGE_DESCRIPTION = `Something didn't load correctly on our end.`;

	constructor(err) {
		console.log('ErrorPage-style overlay constructor called with:', err);

    // Call editor frame with the error (via post message)
		this.sendErrorToParent(err);

    // Create the overlay elements properly
    this.createOverlay();
	}

  createOverlay() {
    // Add styles to head
    const style = document.createElement('style');
    style.textContent = `
      .custom-error-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .custom-error-content {
        text-align: center;
        max-width: 500px;
        padding: 2rem;
      }
      .custom-error-title {
        color: #131720;
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 16px;
      }
      .custom-error-description {
        color: #42454C;
        font-size: 16px;
        line-height: 1.5;
      }
    `;
    document.head.appendChild(style);

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.className = 'custom-error-overlay';
    
    // Create content container
    const content = document.createElement('div');
    content.className = 'custom-error-content';
    
    // Create title
    const title = document.createElement('h1');
    title.className = 'custom-error-title';
    title.textContent = ErrorOverlay.MESSAGE_TITLE;
    
    // Create description
    const description = document.createElement('p');
    description.className = 'custom-error-description';
    description.textContent = ErrorOverlay.MESSAGE_DESCRIPTION;
    
    // Assemble the overlay
    content.appendChild(title);
    content.appendChild(description);
    overlay.appendChild(content);
    
    // Add to DOM
    document.body.appendChild(overlay);
  }

	sendErrorToParent(err) {
		// No-op to prevent import errors in stringified context
		console.log('Error occurred:', err?.message || 'Unknown error');
	}
}

function getOverlayCode() {
	return `
		${ErrorOverlay.toString()}
	`;
}

function patchOverlay(code) {
  return code.replace('class ErrorOverlay', getOverlayCode() + '\nclass OldErrorOverlay');
}

// See https://github.com/withastro/astro/blob/main/packages/astro/src/vite-plugin-astro-server/plugin.ts#L157
export default function customErrorOverlayPlugin() {
	return {
		name: 'custom-error-overlay',
		transform(code, id, opts = {}) {
			if (opts?.ssr) return;

			if (!id.includes('vite/dist/client/client.mjs')) return;

			// Replace the Vite overlay with ours
			return patchOverlay(code);
		},
	};
}
