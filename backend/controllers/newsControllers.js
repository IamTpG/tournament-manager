const news_model = require('../model/news');
const { sendMongooseError } = require('../utils/errorResponse');

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
    const { image, title, content, link, published_day } = req.body;

    try {
        const news_data = { image, title, content, link, published_day };

        // Bỏ các trường null/undefined để schema dùng giá trị mặc định.
        // Phải làm trên object THƯỜNG trước khi khởi tạo model: bản cũ chạy
        // Object.keys() trên Mongoose document nên không xoá được gì, khiến
        // `published_day: null` lọt vào DB và làm getAllNews 500 vĩnh viễn.
        Object.keys(news_data).forEach(
            key => (news_data[key] == null) && delete news_data[key]
        );

        const new_news = new news_model(news_data);

        await new_news.save();
        console.log('News saved!');

        res.status(201).json({
            message: 'News created successfully!',
            data: new_news
        });
    } catch (error) {
        console.log('[ERROR][createNews]:', error);
        sendMongooseError(res, error, 'Failed to create news!');
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
