// importing dependencis
const ImageKit = require('@imagekit/nodejs')

// client account private key setup
const client = new ImageKit({
	privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
})

// function for uploading file to imagekit
async function uploadFile(buffer) {
	const response = await client.files.upload({
		file: buffer.toString('base64'),
		fileName: 'post-image.jpg',
	})

	return response
}

// exporting uploadFile function
module.exports = uploadFile