// importing & configuring dotenv
require('dotenv').config()

// Error setup for environmental valriables defenation
if (!process.env.PORT) {
	throw new Error('PORT is not defined in .env')
}
if (!process.env.DB_CONNECTION_URI) {
	throw new Error('DB_CONNECTION_URI is not defined in .env')
}
if (!process.env.JWT_SECRET) {
	throw new Error('JWT_SECRET is not defined in .env')
}
if (!process.env.IMAGEKIT_PRIVATE_KEY) {
	throw new Error('IMAGEKIT_PRIVATE_KEY is not defined in .env')
}

// configuration object
const config = {
	PORT: process.env.PORT,
	DB_CONNECTION_URI: process.env.DB_CONNECTION_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
}

// exporting config object
module.exports = config