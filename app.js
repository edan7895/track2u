// ============================================================
// 配置
// ============================================================
// ⚠️ 重要：请将下面的 API_KEY 替换为你自己的 RapidAPI Key
const API_KEY = '29ee217e0fmshc78f9fc10f1d568p130b33jsnaf58aa171b01'; // 示例，建议替换
const API_HOST = 'free-football-soccer-videos.p.rapidapi.com';
const API_URL = 'https://free-football-soccer-videos.p.rapidapi.com/';

// 刷新间隔（毫秒）
const REFRESH_INTERVAL = 60000; // 60 秒

// ============================================================
// 模拟数据（包含多种运动，比分和比赛时间会动态微变）
// ============================================================
let matchesData = [
    {
        id: 'm1',
        sport: 'football',
        homeTeam: '利物浦',
        awayTeam: '曼城',
        homeScore: 2,
        awayScore: 1,
        time: '67\'',
        highlightUrl: null, // 将由 API 填充
        logoColor: '#c0392b'
    },
    {
        id: 'm2',
        sport: 'football',
        homeTeam: '皇家马德里',
        awayTeam: '巴塞罗那',
        homeScore: 1,
        awayScore: 1,
        time: '43\'',
        highlightUrl: null,
        logoColor: '#f1c40f'
    },
    {
        id: 'm3',
        sport: 'basketball',
        homeTeam: '湖人',
        awayTeam: '凯尔特人',
        homeScore: 78,
        awayScore: 72,
        time: 'Q3 6:23',
        highlightUrl: null,
        logoColor: '#552a83'
    },
    {
        id: 'm4',
        sport: 'rugby',
        homeTeam: '全黑队',
        awayTeam: '跳羚队',
        homeScore: 14,
        awayScore: 10,
        time: '58\'',
        highlightUrl: null,
        logoColor: '#1a5276'
    },
    {
        id: 'm5',
        sport: 'badminton',
        homeTeam: '安赛龙',
        awayTeam: '桃田贤斗',
        homeScore: 21,
        awayScore: 19,
        time: '决胜局',
        highlightUrl: null,
        logoColor: '#2ecc71'
    },
    {
        id: 'm6',
        sport: 'other',
        homeTeam: '纳达尔',
        awayTeam: '德约科维奇',
        homeScore: 3,
        awayScore: 2,
        time: '决胜盘',
        highlightUrl: null,
        logoColor: '#e67e22'
    }
];

// ============================================================
// DOM 引用
// ============================================================
const grid = document.getElementById('matchesGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const refreshBtn = document.getElementById('refreshBtn');
const updateCountdown = document.getElementById('updateCountdown');

let currentFilter = 'all';
let countdownTimer = null;
let remainingSeconds = 60;

// ============================================================
// 辅助函数：随机微调比分（模拟实时变化）
// ============================================================
function jitterScore(score) {
    // 以 20% 概率 ±1 分，但不低于 0
    if (Math.random() < 0.2) {
        const delta = Math.random() < 0.5 ? 1 : -1;
        return Math.max(0, score + delta);
    }
    return score;
}

function updateSimulatedData() {
    matchesData.forEach(m => {
        // 只对未结束的比赛（时间不是 'FT' 之类）进行微调
        if (!m.time.includes('FT') && !m.time.includes('结束')) {
            m.homeScore = jitterScore(m.homeScore);
            m.awayScore = jitterScore(m.awayScore);
        }
        // 随机改变比赛时间（模拟流逝）
        if (m.sport === 'football' && !m.time.includes('FT')) {
            let min = parseInt(m.time) || 0;
            if (min < 90) {
                min += Math.floor(Math.random() * 3) + 1;
                if (min > 90) min = 90;
                m.time = min + '\'';
            }
        }
    });
}

// ============================================================
// 核心：获取足球集锦视频并匹配到足球比赛
// ============================================================
async function fetchHighlights() {
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': API_HOST,
                'x-rapidapi-key': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API 返回数据:', data);

        // 解析视频列表 – 假设数据结构为 { videos: [ { title, embed, ... } ] }
        const videos = data.videos || data || [];
        if (!Array.isArray(videos) || videos.length === 0) {
            console.warn('未获取到视频列表');
            return;
        }

        // 遍历足球比赛，尝试根据标题匹配集锦
        matchesData.forEach(match => {
            if (match.sport !== 'football') return;
            // 清空旧链接
            match.highlightUrl = null;

            // 在视频列表中查找包含主队或客队名称的视频
            for (let video of videos) {
                const title = (video.title || '').toLowerCase();
                const home = match.homeTeam.toLowerCase();
                const away = match.awayTeam.toLowerCase();
                // 如果标题包含两队名称（或部分），则认为匹配
                if (title.includes(home) || title.includes(away)) {
                    // 取第一个匹配的
                    match.highlightUrl = video.embed || video.url || video.link || '#';
                    break;
                }
            }
        });

    } catch (error) {
        console.error('获取集锦失败:', error);
        // 不抛出，仅记录，模拟数据仍可显示
    }
}

// ============================================================
// 渲染比赛卡片
// ============================================================
function renderMatches(filter = currentFilter) {
    const filtered = matchesData.filter(m => {
        if (filter === 'all') return true;
        return m.sport === filter;
    });

    // 隐藏/显示空状态
    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'flex';
        loadingState.style.display = 'none';
        errorState.style.display = 'none';
        return;
    }
    emptyState.style.display = 'none';
    loadingState.style.display = 'none';
    errorState.style.display = 'none';

    let html = '';
    filtered.forEach(m => {
        const homeInitial = m.homeTeam.charAt(0).toUpperCase();
        const awayInitial = m.awayTeam.charAt(0).toUpperCase();
        const hasHighlight = m.highlightUrl && m.highlightUrl !== '#';
        const highlightDisabled = hasHighlight ? '' : 'disabled';

        html += `
            <div class="match-card" data-id="${m.id}">
                <span class="match-sport">${m.sport}</span>
                <div class="match-teams">
                    <div class="team">
                        <div class="team-logo" style="border-color: ${m.logoColor || '#2a3a4a'};">
                            ${homeInitial}
                        </div>
                        <span class="team-name">${m.homeTeam}</span>
                    </div>
                    <div class="match-score">${m.homeScore} - ${m.awayScore}</div>
                    <div class="team">
                        <div class="team-logo" style="border-color: ${m.logoColor || '#2a3a4a'};">
                            ${awayInitial}
                        </div>
                        <span class="team-name">${m.awayTeam}</span>
                    </div>
                </div>
                <div class="match-time">${m.time}</div>
                <div class="match-actions">
                    <button class="btn-highlight" ${highlightDisabled} data-url="${m.highlightUrl || ''}">
                        <i class="fas fa-video"></i> 观看集锦
                    </button>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;

    // 绑定集锦按钮点击事件
    document.querySelectorAll('.btn-highlight:not([disabled])').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const url = this.dataset.url;
            if (url && url !== '#') {
                window.open(url, '_blank');
            } else {
                alert('该比赛暂无集锦视频');
            }
        });
    });
}

// ============================================================
// 完整刷新流程
// ============================================================
async function refreshData() {
    try {
        // 显示加载状态（如果 grid 为空）
        if (grid.children.length === 0) {
            loadingState.style.display = 'flex';
            errorState.style.display = 'none';
            emptyState.style.display = 'none';
        }

        // 1. 更新模拟比分和时间
        updateSimulatedData();

        // 2. 尝试获取集锦（仅足球）
        await fetchHighlights();

        // 3. 重新渲染
        renderMatches(currentFilter);

        // 4. 更新状态时间
        document.getElementById('lastUpdate').textContent = '刚刚更新';
        // 重置倒计时
        remainingSeconds = 60;
        updateCountdown.textContent = remainingSeconds + 's';

    } catch (error) {
        console.error('刷新失败:', error);
        errorMessage.textContent = error.message || '未知错误';
        errorState.style.display = 'flex';
        loadingState.style.display = 'none';
        emptyState.style.display = 'none';
    } finally {
        // 隐藏加载
        loadingState.style.display = 'none';
    }
}

// ============================================================
// 定时器 & 倒计时
// ============================================================
function startCountdown() {
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
        remainingSeconds--;
        if (remainingSeconds <= 0) {
            remainingSeconds = 60;
            // 自动刷新
            refreshData();
        }
        updateCountdown.textContent = remainingSeconds + 's';
    }, 1000);
}

// ============================================================
// 筛选按钮事件
// ============================================================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.sport;
        renderMatches(currentFilter);
    });
});

// ============================================================
// 手动刷新 & 重试
// ============================================================
refreshBtn.addEventListener('click', refreshData);
retryBtn.addEventListener('click', refreshData);

// ============================================================
// 初始化
// ============================================================
async function init() {
    await refreshData();
    startCountdown();
}

init();