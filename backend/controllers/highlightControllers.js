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
        const highlight_data = { URL, image, title, description };

        // Bỏ trường null/undefined trên object THƯỜNG trước khi khởi tạo model
        // (bản cũ chạy trên Mongoose document nên không xoá được gì).
        Object.keys(highlight_data).forEach(
            key => (highlight_data[key] == null) && delete highlight_data[key]
        );

        const new_highlight = new highlight_model(highlight_data);

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