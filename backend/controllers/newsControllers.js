const news_model = require('../model/news');

/**
 * Function to create a new news
 * @param {Object} req.body includes title, content, game, published_day (optional)
 * 
 * @returns {Object} JSON response with news data or error message
 * 
 * @example
 * // POST /api/news
 */
const createNews = async (req, res) => {
    const { title, content, published_day } = req.body;

    try {
        const new_news = new news_model({
            image,
            title,
            content,
            link,
            published_day
        });

        // Remove undefined/null fields to let default values work
        Object.keys(new_news).forEach(
            key => (new_news[key] == null) && delete new_news[key]
        );

        await new_news.save();
        console.log('News saved!');

        res.status(201).json({
            message: 'News created successfully!',
            data: new_news
        });
    } catch (error) {
        console.log('[ERROR][createNews]:', error);
        res.status(500).json({
            message: 'Failed to create news!'
        });
    }
};

/**
 * Function to get all news
 * 
 * @returns {Object} JSON response with list of news or error message
 * 
 * @example
 * // GET /api/news
 */
const getAllNews = async (req, res) => {
    try {
        const news = await news_model.find({}, {_id: 0, __v: 0});

        const formatted_news = news.map(a => ({
            image: a.image,
            title: a.title,
            content: a.content,
            link: a.link,
            published_day: a.published_day.toLocaleDateString('en-GB')
        }));

        res.status(200).json(formatted_news);
    } catch (error) {
        console.log('[ERROR][getAllNews]:', error);
        res.status(500).json({
            message: 'Failed to fetch news!'
        });
    }
};

module.exports = {
    createNews,
    getAllNews
};
