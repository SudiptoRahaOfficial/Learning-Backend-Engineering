// importing dependencis
const { Schema, model } = require('mongoose')

// making schema
const noteSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
)

// making model
const noteModel = model('note', noteSchema)

// exporting model
module.exports = noteModel