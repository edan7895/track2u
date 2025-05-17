async function searchTracking() {
  const trackingNumber = document.getElementById('trackingNumber').value;
  const resultDiv = document.getElementById('result');

  if (!trackingNumber) {
    resultDiv.innerHTML = `<div class="error">请输入快递单号</div>`;
    return;
  }

  resultDiv.innerHTML = `<div class="loading">查询中...</div>`;

  try {
    const response = await fetch(`/api/search?number=${encodeURIComponent(trackingNumber)}`);
    const data = await response.json();

    if (data.error) throw new Error(data.error);

    let html = '';
    data.events.forEach(event => {
      html += `
        <div class="event">
          <div class="time">${event.time}</div>
          <div class="status">${event.status}</div>
          <div class="location">${event.location}</div>
          <div class="description">${event.description}</div>
        </div>
      `;
    });

    resultDiv.innerHTML = html || `<div class="empty">无物流信息</div>`;
  } catch (error) {
    resultDiv.innerHTML = `<div class="error">错误：${error.message}</div>`;
  }
}