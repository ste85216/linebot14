import axios from 'axios'
import template from '../templates/100design.js'

export default async (event) => {
  try {
    const { data } = await axios.get('https://www.100.com.tw/v1/web_article')
    const weeklyHotTopics = data.data.weekly_hot_topic

    // 確認 weeklyHotTopics 是否有並且是數列
    if (!Array.isArray(weeklyHotTopics)) {
      throw new Error('Invalid data format from API')
    }

    // 只取前五筆資料
    const topFiveArticles = weeklyHotTopics.slice(0, 5)

    // 將獲取資料to template
    const replies = topFiveArticles.map(d => {
      const t = template()
      t.body.contents[0].url = d.cover_img
      t.body.contents[1].text = d.title
      t.body.contents[2].contents[0].contents[1].text = d.created_at
      t.footer.contents[0].action.uri = `https://www.100.com.tw/v2/theme/${d.topic_id}`
      return t
    })

    const result = await event.reply({
      type: 'flex',
      altText: '本週熱門文章',
      contents: {
        type: 'carousel',
        contents: replies
      }
    })

    if (process.env.DEBUG === 'true') {
      console.log(result)
    }
  } catch (error) {
    console.error('Error fetching or processing data:', error)

    try {
      await event.reply('發生錯誤')
    } catch (replyError) {
      console.error('Error sending reply:', replyError)
    }
  }
}
