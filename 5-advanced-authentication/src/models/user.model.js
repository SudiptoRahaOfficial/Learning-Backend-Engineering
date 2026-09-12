// importing dependencis
const { Schema, model } = require('mongoose')

// making schema
const userSchema = new Schema(
	{
		username: {
			type: String,
			trim: true,
			required: [true, 'Username is required'],
			unique: [true, 'Username must be unique'],
			maxlength: [15, "Username can't larger than 15 characters"],
		},
		email: {
			type: String,
			trim: true,
			required: [true, 'Email is required'],
			unique: [true, 'Email must be unique'],
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: [6, "Password can't be smaller than 6 characters"],
		},
		role: {
			type: String,
			enum: ['user', 'artist'],
			default: 'user',
		},
		verified: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
)

// making model
const userModel = model('user', userSchema)

// exporting model
module.exports = userModel