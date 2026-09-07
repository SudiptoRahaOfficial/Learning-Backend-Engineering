// importing dependencis
const { Schema, model } = require('mongoose')

// making schema
const musicSchema = new Schema(
	{
		uri: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		artist: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: true,
		},
	},
	{ timestamps: true },
)

// making model
const musicModel = model('music', musicSchema)

// exporting model
module.exports = musicModel