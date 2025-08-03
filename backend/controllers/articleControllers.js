const article_model = require('../model/article');

/**
 * Function to create a new article
 * @param {Object} req.body includes title, content, game, published_day (optional)
 * 
 * @returns {Object} JSON response with article data or error message
 * 
 * @example
 * // POST /api/article
 */
const createArticle = async (req, res) => {
    const { title, content, published_day } = req.body;

    try {
        const new_article = new article_model({
            image,
            title,
            content,
            link,
            published_day
        });

        // Remove undefined/null fields to let default values work
        Object.keys(new_article).forEach(
            key => (new_article[key] == null) && delete new_article[key]
        );

        await new_article.save();
        console.log('Article saved!');

        res.status(201).json({
            message: 'Article created successfully!',
            data: new_article
        });
    } catch (error) {
        console.log('[ERROR][createArticle]:', error);
        res.status(500).json({
            message: 'Failed to create article!'
        });
    }
};

/**
 * Function to get all articles
 * 
 * @returns {Object} JSON response with list of articles or error message
 * 
 * @example
 * // GET /api/article
 */
const getAllArticles = async (req, res) => {
    try {
        const articles = await article_model.find({}, {_id: 0, __v: 0});

        const formatted_articles = articles.map(a => ({
            image: a.image,
            title: a.title,
            content: a.content,
            link: a.link,
            published_day: a.published_day.toLocaleDateString('en-GB')
        }));

        res.status(200).json(formatted_articles);
    } catch (error) {
        console.log('[ERROR][getAllArticles]:', error);
        res.status(500).json({
            message: 'Failed to fetch articles!'
        });
    }
};

module.exports = {
    createArticle,
    getAllArticles
};