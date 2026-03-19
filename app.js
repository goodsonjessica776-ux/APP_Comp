document.addEventListener('DOMContentLoaded', () => {
    // Check if data is loaded from data.js
    if (typeof ADS_DATA === 'undefined') {
        renderEmptyState("尚未获取到数据。请先执行 crawler 里的 python 爬虫来获取数据");
        return;
    }

    let currentData = [...ADS_DATA];
    const grid = document.getElementById('galleryGrid');
    const totalCount = document.getElementById('totalCount');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    const formatNumber = (num) => {
        if (!num) return "0";
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + ' w';
        }
        return num.toLocaleString();
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === "Unknown") return "最近";
        const d = new Date(dateStr);
        return isNaN(d) ? dateStr : `${d.getMonth() + 1}月${d.getDate()}日`;
    };

    const renderCards = (data) => {
        grid.innerHTML = '';
        totalCount.textContent = data.length;

        if (data.length === 0) {
            renderEmptyState("未找到匹配的广告素材");
            return;
        }

        data.forEach((ad, index) => {
            const card = document.createElement('div');
            card.className = 'ad-card';

            const rankBadge = index < 3 
                ? `<div class="rank-badge" style="background: ${index === 0 ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : index === 1 ? 'linear-gradient(135deg, #94a3b8, #e2e8f0); color: #0f172a' : 'linear-gradient(135deg, #b45309, #d97706)'}">TOP ${index + 1}</div>` 
                : `<div class="rank-badge" style="background: rgba(255,255,255,0.1)">NO. ${index + 1}</div>`;

            card.innerHTML = `
                ${rankBadge}
                <div class="card-media">
                    <video loop muted playsinline>
                        <source src="public/videos/${ad.videoName}" type="video/mp4">
                    </video>
                </div>
                <div class="card-body">
                    <h3 class="card-title" title="${ad.title}">${ad.title}</h3>
                    <div class="card-meta">
                        <div class="meta-item">
                            <span class="meta-label">曝光量</span>
                            <span class="meta-value impressions">${formatNumber(ad.impressions)}</span>
                        </div>
                        <div class="meta-item" style="text-align: right;">
                            <span class="meta-label">发布时间</span>
                            <span class="meta-value">${formatDate(ad.date)}</span>
                        </div>
                    </div>
                </div>
            `;

            // Hover to play
            const video = card.querySelector('video');
            card.addEventListener('mouseenter', () => {
                video.play().catch(e => console.log("Play interrupted or pending"));
            });
            card.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });

            grid.appendChild(card);
        });
    };

    const renderEmptyState = (msg) => {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>${msg}</h3>
                <p style="color: var(--text-secondary); margin-top: 1rem">您可以尝试更换搜索词，或运行爬虫更新数据。</p>
            </div>
        `;
    };

    const handleSortAndFilter = () => {
        const query = searchInput.value.toLowerCase();
        const sortMode = sortSelect.value;

        // Filter
        let filtered = ADS_DATA.filter(ad => ad.title.toLowerCase().includes(query));

        // Sort
        filtered.sort((a, b) => {
            if (sortMode === 'impression_desc') return b.impressions - a.impressions;
            if (sortMode === 'impression_asc') return a.impressions - b.impressions;
            if (sortMode === 'date_desc') {
                return new Date(b.date) - new Date(a.date);
            }
            return 0;
        });

        renderCards(filtered);
    };

    // Event Listeners
    searchInput.addEventListener('input', handleSortAndFilter);
    sortSelect.addEventListener('change', handleSortAndFilter);

    // Initial render
    handleSortAndFilter();
});
