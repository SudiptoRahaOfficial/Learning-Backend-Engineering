/*
 * file name: uploadWithMulter.js
 * responsibility: responsible for uploading functionality using multer
 */

const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
module.exports = upload