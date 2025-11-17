(function () {
  // Get the script tag that loaded this file
  const scriptTag = document.currentScript;
  const donateId = scriptTag?.getAttribute("data-donate-id") || "default-id";

  // Configuration
  const config = {
    donateUrl: `https://buymeatoken.co/donate/${donateId}`,
    buttonIconUrl: "./x-dp.png",
  };
  
  // Create and inject styles
  const style = document.createElement("style");
  style.textContent = `
    /* Widget container */
    #support-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    /* Support button */
    #support-widget-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #000;
      border: none;
      outline: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
    }

    #support-widget-btn:hover {
      transform: scale(1.1);
    }

    #support-widget-btn img {
      object-fit: contain;
      width: 28px;
      height: 28px;
    }

    /* Modal */
    #support-widget-modal {
      display: none;
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 400px;
      max-width: calc(100vw - 40px);
      height: 600px;
      max-height: calc(100vh - 140px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      overflow: hidden;
      animation: slideUp 0.3s ease;
    }

    #support-widget-modal.active {
      display: flex;
      flex-direction: column;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Iframe container */
    #support-widget-content {
      flex: 1;
      position: relative;
      background: #f5f5f5;
    }

    #support-widget-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
    }

    /* Loading indicator */
    #support-widget-loader {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 14px;
      color: #666;
    }

    #support-widget-loader.hidden {
      display: none;
    }

    /* Error message */
    #support-widget-error {
      display: none;
      padding: 20px;
      text-align: center;
      color: #666;
    }

    #support-widget-error.active {
      display: block;
    }

    #support-widget-error a {
      color: #000;
      text-decoration: underline;
    }

    /* Mobile responsive */
    @media (max-width: 480px) {
      #support-widget-modal {
        width: calc(100vw - 40px);
        height: calc(100vh - 140px);
        bottom: 100px;
        right: 20px;
      }
    }
  `;
  document.head.appendChild(style);

  // Initialize widget when DOM is ready
  function initWidget() {
    // Create widget container
    const container = document.createElement("div");
    container.id = "support-widget-container";
    container.innerHTML = `
      <button id="support-widget-btn" aria-label="Open support widget">
        <img src="${config.buttonIconUrl}" alt="Support" />
      </button>
      
      <div id="support-widget-modal">
        <div id="support-widget-content">
          <div id="support-widget-loader">Loading...</div>
          <div id="support-widget-error">
            <p>Unable to load donation form in widget.</p>
            <p><a href="${config.donateUrl}" target="_blank" rel="noopener noreferrer">Open in new tab →</a></p>
          </div>
          <iframe 
            id="support-widget-iframe"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            title="Donation form"
            allow="payment"
          ></iframe>
        </div>
      </div>
    `;
    
    document.body.appendChild(container);

    // Get elements
    const btn = document.getElementById("support-widget-btn");
    const modal = document.getElementById("support-widget-modal");
    const iframe = document.getElementById("support-widget-iframe");
    const loader = document.getElementById("support-widget-loader");
    const errorMsg = document.getElementById("support-widget-error");

    let iframeLoaded = false;
    let loadTimeout;

    // Handle iframe load
    iframe.addEventListener("load", function () {
      iframeLoaded = true;
      loader.classList.add("hidden");
      clearTimeout(loadTimeout);
    });

    // Handle iframe error
    iframe.addEventListener("error", function () {
      console.error("Iframe failed to load");
      loader.classList.add("hidden");
      errorMsg.classList.add("active");
      clearTimeout(loadTimeout);
    });

    // Toggle modal
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      
      if (modal.classList.contains("active")) {
        modal.classList.remove("active");
      } else {
        // Load iframe content when opening (if not already loaded)
        if (!iframe.src) {
          iframe.src = config.donateUrl;
          
          // Set timeout to show error if iframe doesn't load
          loadTimeout = setTimeout(() => {
            if (!iframeLoaded) {
              console.warn("Iframe load timeout - may be blocked by X-Frame-Options");
              loader.classList.add("hidden");
              errorMsg.classList.add("active");
            }
          }, 10000); // 10 second timeout
        }
        modal.classList.add("active");
      }
    });

    // Close on outside click
    document.addEventListener("click", function (e) {
      if (
        modal.classList.contains("active") &&
        !modal.contains(e.target) &&
        !btn.contains(e.target)
      ) {
        modal.classList.remove("active");
      }
    });

    // Close on ESC key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        modal.classList.remove("active");
      }
    });

    // Debug: Log config
    console.log("Support Widget Initialized", {
      donateUrl: config.donateUrl,
      donateId: donateId
    });
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }
})();