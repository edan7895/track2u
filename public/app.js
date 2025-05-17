// 多语言支持
const i18n = {
  en: {
    title: "Global Logistics Tracker",
    search: "Search",
    placeholder: "Enter tracking number",
    error: "Error: ",
    empty: "Please enter tracking number"
  },
  zh: {
    title: "全球物流查询",
    search: "查询",
    placeholder: "输入快递单号",
    error: "错误：",
    empty: "请输入快递单号"
  }
};

// 自动检测语言
const userLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
document.documentElement.lang = userLang;

// 应用语言
document.querySelectorAll('[data-i18n]').forEach(el => {
  const key = el.dataset.i18n;
  el.innerHTML = i18n[userLang][key] || i18n.en[key];
});

// 输入框placeholder
document.getElementById('trackingNumber').placeholder = i18n[userLang].placeholder;

async function searchTracking() {
  const number = document.getElementById('trackingNumber').value.trim();
  const resultDiv = document.getElementById('result');

  if (!number) {
    resultDiv.innerHTML = `<div class="error">${i18n[userLang].empty}</div>`;
    return;
  }

  resultDiv.innerHTML = `<div class="loading">Loading...</div>`;

  try {
    const response = await fetch(`/api/search?number=${encodeURIComponent(number)}`);
    const data = await response.json();

    if (data.error) throw new Error(data.error);

    let html = '';
    data.events.forEach(event => {
      html += `
        <div class="event">
          <div class="time">${event.time}</div>
          <div class="location">${event.location}</div>
          <div class="description">${event.description}</div>
          <div class="status">${event.status}</div>
        </div>
      `;
    });

    resultDiv.innerHTML = html || `<div class="empty">No tracking data found</div>`;
  } catch (error) {
    resultDiv.innerHTML = `<div class="error">${i18n[userLang].error}${error.message}</div>`;
  }
}