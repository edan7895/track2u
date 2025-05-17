const axios = require('axios');

module.exports = async (req, res) => {
  const { number } = req.query;
  const API_KEY = process.env.SHIP24_API_KEY; // 环境变量名改为 SHIP24_API_KEY

  try {
    // Ship24 API 请求（根据文档调整）
    const response = await axios.post(
      'https://api.ship24.com/graphql', // 以实际API地址为准
      {
        query: `
          query TrackShipment($trackingNumber: String!) {
            track(trackingNumber: $trackingNumber) {
              events {
                date
                status
                location
                description
              }
            }
          }
        `,
        variables: {
          trackingNumber: number
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`, // 根据实际认证方式调整
          'Accept-Encoding': 'gzip'
        }
      }
    );

    // 处理 Ship24 返回数据
    const events = response.data.data.track.events.map(event => ({
      time: new Date(event.date).toLocaleString(),
      location: event.location,
      description: event.description,
      status: event.status
    }));

    res.status(200).json({ events });
  } catch (error) {
    console.error('Ship24 API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data?.message || '查询失败',
      details: error.response?.data?.errors 
    });
  }
};