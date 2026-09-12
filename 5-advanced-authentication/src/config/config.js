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
if (!process.env.GOOGLE_CLIENT_ID) {
	throw new Error('GOOGLE_CLIENT_ID is not defined in .env')
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
	throw new Error('GOOGLE_CLIENT_SECRET is not defined in .env')
}
if (!process.env.GOOGLE_REFRESH_TOKEN) {
	throw new Error('GOOGLE_REFRESH_TOKEN is not defined in .env')
}
if (!process.env.GOOGLE_USER) {
	throw new Error('GOOGLE_USER is not defined in .env')
}

// configuration object
const config = {
	PORT: process.env.PORT,
	DB_CONNECTION_URI: process.env.DB_CONNECTION_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
	GOOGLE_USER: process.env.GOOGLE_USER,
}

// exporting config object
module.exports = config