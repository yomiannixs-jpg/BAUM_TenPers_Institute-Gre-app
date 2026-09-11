(() => {
  let deferredPrompt = null;

  function installButton(){
    return document.getElementById("btPwaInstall");
  }

  function showInstallButton(){
    const btn = installButton();
    if (btn) btn.hidden = false;
  }

  function hideInstallButton(){
    const btn = installButton();
    if (btn) btn.hidden = true;
  }

  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
    console.info("BAUM GRE PWA: install prompt is ready.");
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    hideInstallButton();
    console.info("BAUM GRE PWA installed.");
  });

  window.BAUM_PWA = {
    async install(){
      if (!deferredPrompt) {
        alert(
          "Chrome has not made the install prompt available yet.\n\n" +
          "Use Chrome's address-bar Install icon or menu → Cast, save and share → Install page as app.\n\n" +
          "Also confirm you are using http://localhost:8080/ or the HTTPS Vercel site."
        );
        return;
      }
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      hideInstallButton();
    },
    async status(){
      return {
        secureContext: window.isSecureContext,
        standalone: window.matchMedia("(display-mode: standalone)").matches,
        serviceWorker: "serviceWorker" in navigator,
        installPromptReady: !!deferredPrompt
      };
    }
  };

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const reg = await navigator.serviceWorker.register("/service-worker.js", {scope:"/"});
        console.info("BAUM GRE PWA service worker registered:", reg.scope);
      } catch (e) {
        console.error("BAUM GRE PWA service worker failed:", e);
      }
    });
  }
})();
