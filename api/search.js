const axios = require('axios');

module.exports = async (req, res) => {
  const { number } = req.query;
  const apiKey = process.env.API_KEY || 'B94530AA7B2CE47F6E4D9C20656BF547'; // 从环境变量读取

  try {
    const response = await axios.get(`https://api.17track.net/track/v2.2/gettrackinfo`, {
      params: {
        trackNumber: number
      },
      headers: {
        'Content-Type': 'application/json',
        '17token': apiKey
      }
    });

    // 提取时间线数据并排序
    const events = response.data.data.accepted[0].events
      .map(event => ({
        time: new Date(event.time).toLocaleString(),
        location: event.location,
        description: event.description,
        status: event.status
      }))
      .reverse(); // 按时间倒序排列

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ 
      error: error.response?.data?.message || '查询失败' 
    });
  }
};