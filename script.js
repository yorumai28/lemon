document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("video-url");
    const playButton = document.getElementById("play-button");
    const videoContainer = document.getElementById("video-container");
    const historyButton = document.getElementById("history-btn");
    const menuPanel = document.getElementById("menu-panel");
    const historyContainer = document.getElementById("history-container");
    const historyTab = document.querySelector('[data-tab="history"]');
    const tabs = document.querySelectorAll(".tab");

    // 年を現在の年に自動設定
    document.getElementById("year").textContent = new Date().getFullYear();

    playButton.addEventListener("click", function () {
        let url = input.value.trim();
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

        if (!youtubeRegex.test(url)) {
            alert("正しいYouTubeのURLを入力してください。");
            return;
        }

        let videoId = "";
        const match = url.match(/(?:v=|\/|embed\/|youtu.be\/)([0-9A-Za-z_-]{11})/);
        if (match) {
            videoId = match[1];
        }

        if (!videoId) {
            alert("動画IDを取得できませんでした。");
            return;
        }

        fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
            .then(response => response.json())
            .then(data => {
                let title = data.title || "不明なタイトル";
                addToHistory(videoId, title);

                videoContainer.innerHTML = `
                    <iframe width="560" height="315"
                        src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0"
                        frameborder="0" allowfullscreen title="lemon">
                    </iframe>
                `;
            })
            .catch(() => alert("動画タイトルを取得できませんでした。"));
    });

    function addToHistory(videoId, title) {
        let history = JSON.parse(localStorage.getItem("videoHistory")) || [];

        history = history.filter(item => item.videoId !== videoId);
        history.unshift({ videoId, title });

        if (history.length > 50) history.pop();
        localStorage.setItem("videoHistory", JSON.stringify(history));

        updateHistoryUI();
    }

    function updateHistoryUI() {
        let history = JSON.parse(localStorage.getItem("videoHistory")) || [];
        historyContainer.innerHTML = "";

        history.forEach((item) => {
            let historyItem = document.createElement("div");
            historyItem.classList.add("history-item");
            historyItem.innerHTML = `
                <a href="#" class="history-link" data-videoid="${item.videoId}">
                    ${item.title}
                </a>
            `;
            historyContainer.appendChild(historyItem);
        });

        document.querySelectorAll(".history-link").forEach((link) => {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                let videoId = this.getAttribute("data-videoid");

                videoContainer.innerHTML = `
                    <iframe width="560" height="315"
                        src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0"
                        frameborder="0" allowfullscreen title="lemon">
                    </iframe>
                `;

                let clickedTitle = this.textContent;
                addToHistory(videoId, clickedTitle);
            });
        });
    }

    historyButton.addEventListener("click", function () {
        menuPanel.style.display = menuPanel.style.display === "block" ? "none" : "block";
    });

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            historyContainer.style.display = "block";
        });
    });

    updateHistoryUI();
});
