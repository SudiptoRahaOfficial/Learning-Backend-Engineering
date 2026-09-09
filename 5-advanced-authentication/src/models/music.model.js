// importing dependencis
const { Schema, model } = require('mongoose')

// making schema
const musicSchema = new Schema(
	{
		uri: {
			type: String,
			required: [true, 'Music uri is requried'],
			unique: [true, 'This perticular music already exists'],
		},
		title: {
			type: String,
			required: [true, 'Music title is required'],
			unique: [true, 'Music already extists with the same title'],
		},
		artist: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: [true, 'Artist is required'],
		},
	},
	{ timestamps: true },
)

// making model
const musicModel = model('music', musicSchema)

// exporting model
module.exports = musicModel