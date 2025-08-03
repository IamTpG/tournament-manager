const highlight_model = require('../model/highlight');

/**
 * Function to create a new article
 * @param {Object} req.body includes title, content, game, published_day (optional)
 * 
 * @returns {Object} JSON response with article data or error message
 * 
 * @example
 * // POST /api/article
 */

const createHighlight = async (req, res) => { 
    const {  URL, image, title, description } = req.body; 

    try {
        const new_highlight = new highlight_model({
            URL,
            image,
            title,
            description
        });

        // Remove undefined/null fields to let default values work
        Object.keys(new_highlight).forEach(
            key => (new_highlight[key] == null) && delete new_highlight[key]
        );

        await new_highlight.save();
        console.log('Highlight saved!');

        res.status(201).json({
            message: 'Highlight created successfully!',
            data: new_highlight
        });
    } catch (error) {
        console.log('[ERROR][createHighlight]:', error);
        res.status(500).json({
            message: 'Failed to create highlight!'
        });
    }
};

const getAllHighlights = async(req,res) =>  {
    try {
        const highlights = await highlight_model.find({},{_id: 0, __v: 0})

        res.status(200).json(highlights)
    }
    catch (error){
        console.log('[ERROR][getAllHighlights]:',error)
        res.status(500).json({message: 'Failed to fetch highlights! '})
    }
}

module.exports = {
    createHighlight,
    getAllHighlights
};