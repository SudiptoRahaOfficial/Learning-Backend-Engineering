// importing dependencis
const { Schema, model } = require('mongoose')

// making schema
const albumSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
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
			required: true,
		},
	},
	{ timestamps: true },
)

// making model
const albumModel = model('album', albumSchema)

// exporting model
module.exports = albumModel