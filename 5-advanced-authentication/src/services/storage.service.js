// importing dependencis
const ImageKit = require('@imagekit/nodejs')
const config = require('../config/config')

// client account private key setup
const client = new ImageKit({
	privateKey: config.IMAGEKIT_PRIVATE_KEY,
})

// function for uploading file to imagekit
async function uploadFile(file) {
	const response = await client.files.upload({
		file,
		fileName: `music_${Date.now()}`,
		folder: 'advanced-auth-spotify/music',
	})

	return response
}

// exporting uploadFile function
module.exports = uploadFile