// 多语言配置
const i18n = {
  en: {
    title: "Global Logistics Tracker",
    search: "Search",
    placeholder: "Enter tracking number",
    loading: "Fetching tracking info...",
    empty: "No tracking events found",
    error: "Error: ",
    statusLabels: {
      in_transit: "In Transit",
      delivered: "Delivered",
      exception: "Exception",
      out_for_delivery: "Out for Delivery"
    }
  },
  zh: {
    title: "全球物流追踪",
    search: "查询",
    placeholder: "输入快递单号",
    loading: "正在获取物流信息...",
    empty: "未找到物流记录",
    error: "错误：",
    statusLabels: {
      in_transit: "运输中",
      delivered: "已送达",
      exception: "异常状态",
      out_for_delivery: "派送中"
    }
  }
};

// 自动检测语言
const userLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
document.documentElement.lang = userLang;

// 应用语言
document.querySelectorAll('[data-i18n]').forEach(el => {
  const key = el.dataset.i18n;
  el.textContent = i18n[userLang][key] || i18n.en[key];
});
document.getElementById('trackingNumber').placeholder = i18n[userLang].placeholder;

// 核心查询函数
async function searchTracking() {
  const trackingNumber = document.getElementById('trackingNumber').value.trim();
  const resultDiv = document.getElementById('result');
  const statusDiv = document.getElementById('status');
  
  // 重置状态
  resultDiv.innerHTML = '';
  statusDiv.className = 'hidden';

  if (!trackingNumber) {
    showError(i18n[userLang].error + i18n[userLang].empty);
    return;
  }

  // 显示加载状态
  statusDiv.className = 'loading';
  statusDiv.textContent = i18n[userLang].loading;

  try {
    const response = await fetch(`/api/search?number=${encodeURIComponent(trackingNumber)}`);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);

    renderEvents(data.events);
    
  } catch (error) {
    showError(`${i18n[userLang].error}${error.message}`);
  } finally {
    statusDiv.className = 'hidden';
  }
}

// 渲染物流事件
function renderEvents(events = []) {
  const resultDiv = document.getElementById('result');
  
  if (events.length === 0) {
    resultDiv.innerHTML = `<div class="empty">${i18n[userLang].empty}</div>`;
    return;
  }

  resultDiv.innerHTML = events.map(event => `
    <div class="event">
      <div class="event-header">
        <div class="event-time">${event.time}</div>
        <div class="event-status ${event.status.toLowerCase().replace(' ', '-')}">
          ${getStatusLabel(event.status)}
        </div>
      </div>
      <div class="location">${event.location || '-'}</div>
      <div class="description">${event.description || ''}</div>
    </div>
  `).join('');
}

// 显示错误信息
function showError(message) {
  const statusDiv = document.getElementById('status');
  statusDiv.className = 'error';
  statusDiv.textContent = message;
}

// 更新状态标签映射（根据API的status字段）
function getStatusLabel(status) {
  const statusMap = {
    'in_transit': 'in_transit',
    'delivered': 'delivered',
    'exception': 'exception',
    'out_for_delivery': 'out_for_delivery'
  };
  const key = statusMap[status.toLowerCase()] || 'unknown';
  return i18n[userLang].statusLabels[key] || status;
}

// 回车键支持
document.getElementById('trackingNumber').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchTracking();
});