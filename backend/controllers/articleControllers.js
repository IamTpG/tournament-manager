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
    const { title, content, game, published_day } = req.body;

    try {
        const new_article = new article_model({
            title,
            content,
            game,
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
        const articles = await article_model.find({}, { __v: false });

        const formatted_articles = articles.map(a => ({
            id: a._id,
            title: a.title,
            game: a.game,
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

/**
 * Function to get articles by game
 * 
 * @param {Object} req.params includes game_name
 * @returns {Object} JSON response with filtered articles or error message
 * 
 * @example
 * // GET /api/article/game/Valorant
 */
const getArticlesByGame = async (req, res) => {
    const { game_name } = req.params;

    try {
        const filtered_articles = await article_model.find(
            { game: game_name },
            { __v: false }
        );

        if (filtered_articles.length === 0) {
            return res.status(404).json({
                message: `No articles found for game: ${game_name}`
            });
        }

        const formatted = filtered_articles.map(article => ({
            id: article._id,
            title: article.title,
            published_day: article.published_day.toLocaleDateString('en-GB'),
            content_preview: article.content.slice(0, 100) + '...'
        }));

        res.status(200).json({
            game: game_name,
            articles: formatted
        });
    } catch (error) {
        console.log('[ERROR][getArticlesByGame]:', error);
        res.status(500).json({
            message: 'Failed to fetch articles by game'
        });
    }
};

module.exports = {
    createArticle,
    getAllArticles,
    getArticlesByGame
};