const bcrypt = require('bcrypt');

const saltRounds = 10;

function hash(content) {
    if(content == null || content == '') {
        throw new Error('Content cannot be empty.');
    }
    const hashedContent = bcrypt.hashSync(content, saltRounds);
    return hashedContent;
}

function isValid(content, hashedContent) {
    try {        
        if(content == null || content == '' || hashedContent == null || hashedContent == '') {
            return false;
        }

        const checked = bcrypt.compareSync(content, hashedContent);
        return checked;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    hash,
    isValid
}