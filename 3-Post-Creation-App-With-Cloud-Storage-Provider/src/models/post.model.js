// importing dependencis
const { Schema, model } = require('mongoose')

// making schema
const postSchema = new Schema(
	{
		image: {
			type: String,
			required: true,
		},
		caption: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
)

// making model
const postModel = model('post', postSchema)

// exporting model
module.exports = postModel