import { bangs } from "./bang";
import "./global.css";

function noSearchDefaultPageRender() {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <div class="content-container">
        <h1>Und*ck</h1>
        <p>DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables <a href="https://duckduckgo.com/bang.html" target="_blank">all of DuckDuckGo's bangs.</a></p>
        <div class="url-container"> 
          <input 
            type="text" 
            class="url-input"
            value="https://sov3rain.github.io/unduck/?q=%s"
            readonly 
          />
          <button class="copy-button">
            <img src="clipboard.svg" alt="Copy" />
          </button>
        </div>
      </div>
      <footer class="footer">       
        <a href="https://github.com/Sov3rain/unduck" target="_blank">github</a>
      </footer>
      <button class="settings-button">
        <img src="settings.svg" alt="Settings" />
      </button>
      <div class="modal-overlay" style="display: none;">
        <div class="modal">
          <h2>Settings</h2>
          <div class="modal-content">
            <label for="default-bang-input">Default Bang</label>
            <input type="text" id="default-bang-input" />
          </div>
          <div class="modal-actions">
            <button class="cancel-button">Cancel</button>
            <button class="save-button">Save</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const copyButton = app.querySelector<HTMLButtonElement>(".copy-button")!;
  const copyIcon = copyButton.querySelector("img")!;
  const urlInput = app.querySelector<HTMLInputElement>(".url-input")!;
  const settingsButton = app.querySelector<HTMLButtonElement>(".settings-button")!;
  const modalOverlay = app.querySelector<HTMLDivElement>(".modal-overlay")!;
  const cancelButton = app.querySelector<HTMLButtonElement>(".cancel-button")!;
  const saveButton = app.querySelector<HTMLButtonElement>(".save-button")!;
  const defaultBangInput = app.querySelector<HTMLInputElement>("#default-bang-input")!;

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(urlInput.value);
    copyIcon.src = "/clipboard-check.svg";

    setTimeout(() => {
      copyIcon.src = "/clipboard.svg";
    }, 2000);
  });

  settingsButton.addEventListener("click", () => {
    modalOverlay.style.display = "flex";
    defaultBangInput.value = localStorage.getItem("default-bang") ?? "g";
  });

  cancelButton.addEventListener("click", () => {
    modalOverlay.style.display = "none";
  });

  saveButton.addEventListener("click", () => {
    const newDefaultBang = defaultBangInput.value.trim();
    if (newDefaultBang) {
      localStorage.setItem("default-bang", newDefaultBang);
      modalOverlay.style.display = "none";
    }
  });
}

function getBangredirectUrl() {
  const url = new URL(window.location.href);
  const query = url.searchParams.get("q")?.trim() ?? "";
  if (!query) {
    noSearchDefaultPageRender();
    return null;
  }

  const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "g";
  const defaultBang = bangs.get(LS_DEFAULT_BANG);

  const match = query.match(/!(\S+)/i);

  const bangCandidate = match?.[1]?.toLowerCase();
  const selectedBang = bangs.get(bangCandidate) ?? defaultBang;

  // Remove the first bang from the query
  const cleanQuery = query.replace(/!\S+\s*/i, "").trim();

  // If the query is just `!gh`, use `github.com` instead of `github.com/search?q=`
  if (cleanQuery === "")
    return selectedBang ? `https://${selectedBang.d}` : null;

  // Format of the url is:
  // https://www.google.com/search?q={{{s}}}
  const searchUrl = selectedBang?.u.replace(
    "{{{s}}}",
    // Replace %2F with / to fix formats like "!ghr+t3dotgg/unduck"
    encodeURIComponent(cleanQuery).replace(/%2F/g, "/"),
  );
  if (!searchUrl) return null;

  return searchUrl;
}

function doRedirect() {
  const searchUrl = getBangredirectUrl();
  if (!searchUrl) return;
  window.location.replace(searchUrl);
}

doRedirect();
