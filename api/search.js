const axios = require('axios');

module.exports = async (req, res) => {
  const { number } = req.query;
  const API_KEY = process.env.TRACKINGMY_API_KEY;

  try {
    // 调用 tracking.my API
    const response = await axios.get(
      'https://api.tracking.my/api/v1/track',
      {
        params: {
          trackingNumber: number,
          // carrier: 'poslaju' // 可选项，根据需求添加
        },
        headers: {
          'X-API-Key': API_KEY, // 关键认证头
          'Accept-Encoding': 'gzip'
        }
      }
    );

    // 标准化数据格式
    const events = response.data.data.events.map(event => ({
      time: new Date(event.timestamp).toLocaleString(),
      location: event.location,
      description: event.description,
      status: event.status // 状态字段需与前端映射匹配
    }));

    res.status(200).json({ events });

  } catch (error) {
    console.error('Tracking.my API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // 错误处理（根据API文档中的错误码）
    const errorMessage = error.response?.data?.message || '查询失败';
    res.status(error.response?.status || 500).json({
      error: errorMessage,
      details: error.response?.data?.error || error.message
    });
  }
};