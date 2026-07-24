function showNotification(message, background = "var(--panel-3)", duration = 3000) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${background};
    color: var(--ink-1);
    border: 1px solid var(--line-1);
    padding: 0.75rem 1.25rem;
    border-radius: 2px;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    z-index: 10000;
    transform: translateX(120%);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `;
  notification.innerHTML = `<span>${message}</span>`;

  document.body.appendChild(notification);
  setTimeout(() => { notification.style.transform = "translateX(0)"; }, 100);
  setTimeout(() => {
    notification.style.transform = "translateX(400px)";
    setTimeout(() => { document.body.removeChild(notification); }, 300);
  }, duration);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function () {
    showNotification("Email copied to clipboard");
  }).catch(function (err) {
    console.error("Could not copy text:", err);
  });
}
