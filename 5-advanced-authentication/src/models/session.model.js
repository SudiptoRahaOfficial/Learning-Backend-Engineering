// importing dependencis
const { Schema, model } = require('mongoose')

// making schema
const sessionSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: [true, 'User is required'],
		},
		refreshTokenHash: {
			type: String,
			required: [true, 'Refresh token hash is required'],
		},
		ip: {
			type: String,
			required: [true, 'IP address is required'],
		},
		userAgent: {
			type: String,
			required: [true, 'User agent is required'],
		},
		revoked: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
)

// making model
const sessionModel = model('session', sessionSchema)

// exporting model
module.exports = sessionModel