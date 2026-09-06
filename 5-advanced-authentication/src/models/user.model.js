// importing dependencis
const { Schema, model } = require('mongoose')

// making schema
const userSchema = new Schema(
	{
		username: {
			type: String,
			trim: true,
			required: true,
			unique: true,
			maxlength: 15,
		},
		email: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		role: {
			type: String,
			enum: ['user', 'artist'],
			default: 'user',
		},
	},
	{ timestamps: true },
)

// making model
const userModel = model('user', userSchema)

// exporting model
module.exports = userModel