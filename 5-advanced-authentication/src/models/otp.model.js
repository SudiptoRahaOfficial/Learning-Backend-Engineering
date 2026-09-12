// importing dependencis
const { Schema, model } = require('mongoose')

// making schema
const otpSchema = new Schema(
	{
		email: {
			type: String,
			required: [true, 'Email is required'],
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: [true, 'User is required'],
		},
		otpHash: {
			type: String,
			required: [true, 'OTP hash is required'],
		},
	},
	{ timestamps: true },
)

// making model
const otpModel = model('otp', otpSchema)

// exporting model
module.exports = otpModel