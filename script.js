document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("video-url");
  const playButton = document.getElementById("play-button");
  const videoContainer = document.getElementById("video-container");
  const modeToggle = document.getElementById("mode-toggle");
  const historyButton = document.getElementById("history-btn");
  const menuPanel = document.getElementById("menu-panel");
  const historyContainer = document.getElementById("history-container");
  const tabs = document.querySelectorAll(".tab");

  // 年表示
  document.getElementById("year").textContent = new Date().getFullYear();

  // モード初期化
  let embedMode = localStorage.getItem("embedMode") || "normal";
  updateModeButton();
  modeToggle.addEventListener("click", () => {
    embedMode = (embedMode === "normal") ? "nocookie" : "normal";
    localStorage.setItem("embedMode", embedMode);
    updateModeButton();
  });
  function updateModeButton() {
    modeToggle.textContent = `モード: ${embedMode === 'normal' ? '通常' : 'NoCookie'}`;
  }

  playButton.addEventListener("click", () => {
    const url = input.value.trim();
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!ytRegex.test(url)) return alert("正しいYouTubeのURLを入力してください。");

    const match = url.match(/(?:v=|\/|embed\/|youtu.be\/)([0-9A-Za-z_-]{11})/);
    if (!match) return alert("動画IDを取得できませんでした。");
    const videoId = match[1];

    const domain = (embedMode === "normal") ? "www.youtube.com" : "www.youtube-nocookie.com";
    fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
      .then(res => res.json())
      .then(data => {
        const title = data.title || "不明なタイトル";
        addToHistory(videoId, title, embedMode);
        renderIframe(videoId, domain);
      })
      .catch(() => alert("動画タイトルを取得できませんでした。"));
  });

  // ループ再生用 iframe レンダリング
  function renderIframe(id, domain) {
    const src = [
      `https://${domain}/embed/${id}`,
      `?rel=0`,
      `&autoplay=1`,
      `&loop=1`,
      `&playlist=${id}`
    ].join('');
    videoContainer.innerHTML = `
      <iframe width="560" height="315"
        src="${src}"
        frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
      </iframe>`;
  }

  function addToHistory(id, title, mode) {
    let history = JSON.parse(localStorage.getItem("videoHistory")) || [];
    history = history.filter(item => item.videoId !== id || item.mode !== mode);
    history.unshift({ videoId: id, title, mode });
    if (history.length > 50) history.pop();
    localStorage.setItem("videoHistory", JSON.stringify(history));
    updateHistoryUI();
  }

  function updateHistoryUI() {
    const history = JSON.parse(localStorage.getItem("videoHistory")) || [];
    historyContainer.innerHTML = "";
    history.forEach(item => {
      const div = document.createElement("div");
      div.className = "history-item";
      div.innerHTML = `<a href='#' data-id='${item.videoId}' data-mode='${item.mode}'>
        ${item.title} (${item.mode==='normal'?'通常':'NoCookie'})
      </a>`;
      historyContainer.appendChild(div);
    });
    document.querySelectorAll(".history-item a").forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        const id = a.dataset.id;
        const mode = a.dataset.mode;
        const domain = (mode==='normal')? 'www.youtube.com':'www.youtube-nocookie.com';
        renderIframe(id, domain);
        addToHistory(id, a.textContent, mode);
      });
    });
  }

  historyButton.addEventListener("click", () => {
    menuPanel.style.display = menuPanel.style.display==='block'?'none':'block';
  });
  tabs.forEach(t => t.addEventListener("click", () => t.classList.toggle("active")));

  // 初期履歴描画
  updateHistoryUI();
});