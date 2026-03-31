function showNotification(message, background = "var(--secondary-color)", duration = 3000) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${background};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
  `;
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <i class="fas fa-info-circle"></i>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(notification);
  setTimeout(() => { notification.style.transform = "translateX(0)"; }, 100);
  setTimeout(() => {
    notification.style.transform = "translateX(400px)";
    setTimeout(() => { document.body.removeChild(notification); }, 300);
  }, duration);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function () {
    showNotification("Email copied to clipboard!", "var(--secondary-color)");
  }).catch(function (err) {
    console.error("Could not copy text:", err);
  });
}

function showCVWarning() {
  showNotification(
    "Sorry, you cannot download the CV due to security reasons. Please contact me directly for my resume.",
    "#f59e0b",
    5000
  );
}
