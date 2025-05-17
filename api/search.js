const axios = require('axios');

module.exports = async (req, res) => {
  const { number } = req.query;
  const API_KEY = process.env.SHIP24_API_KEY; // 确保环境变量名匹配

  try {
    // Step 1: 创建追踪器
    const createResponse = await axios.post(
      'https://api.ship24.com/api/v1/trackers',
      {
        trackingNumber: number // 必须字段
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_KEY // 直接使用API密钥
        }
      }
    );

    // Step 2: 获取追踪结果
    const trackerId = createResponse.data.data.tracker.trackerId;
    const getResponse = await axios.get(
      `https://api.ship24.com/api/v1/trackers/${trackerId}/results`,
      {
        headers: {
          'Authorization': API_KEY
        }
      }
    );

    // Step 3: 处理物流事件
    const events = getResponse.data.data.events.map(event => ({
      time: new Date(event.occurrenceDatetime).toLocaleString(),
      location: `${event.location.city}, ${event.location.country}`,
      description: event.status,
      status: event.statusCode
    }));

    res.status(200).json({ events });
    
  } catch (error) {
    console.error('Ship24 API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    res.status(500).json({
      error: error.response?.data?.message || '查询失败',
      details: error.response?.data?.errors || error.message
    });
  }
};