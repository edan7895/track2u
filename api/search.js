const axios = require('axios');

module.exports = async (req, res) => {
  const { number } = req.query;
  const API_KEY = process.env.API_KEY;
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: API_KEY missing' });
  }

  if (!number || number.length < 6) {
    return res.status(400).json({ error: 'Invalid tracking number format' });
  }

  try {
    const response = await axios.get('https://api.17track.net/track/v2.2/gettrackinfo', {
      params: {
        trackNumber: number,
        showAllStatus: true
      },
      headers: {
        'Content-Type': 'application/json',
        '17token': API_KEY
      },
      timeout: 15000 // 15秒超时
    });

    // 调试日志（部署后删除）
    console.log('17Track API Response:', JSON.stringify(response.data, null, 2));

    if (response.data.data.accepted.length === 0) {
      return res.status(404).json({ error: 'Tracking number not found' });
    }

    const events = response.data.data.accepted[0].events
      .map(event => ({
        time: new Date(event.time).toLocaleString(),
        location: event.location,
        description: event.description,
        status: event.status
      }))
      .sort((a, b) => new Date(b.time) - new Date(a.time)); // 按时间倒序

    res.status(200).json({ events });

  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    
    // 分类错误类型
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 'Failed to fetch tracking info';

    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.response?.data?.error || null
    });
  }
};