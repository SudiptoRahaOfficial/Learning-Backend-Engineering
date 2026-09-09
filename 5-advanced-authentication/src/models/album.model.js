// importing dependencis
const { Schema, model } = require('mongoose')

// making schema
const albumSchema = new Schema(
	{
		title: {
			type: String,
			required: [true, 'Album title is required'],
			unique: [true, 'Album already exists with the same title'],
		},
		musics: [
			{
				type: Schema.Types.ObjectId,
				ref: 'music',
			},
		],
		artist: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: [true, 'Artist is required'],
		},
	},
	{ timestamps: true },
)

// making model
const albumModel = model('album', albumSchema)

// exporting model
module.exports = albumModel