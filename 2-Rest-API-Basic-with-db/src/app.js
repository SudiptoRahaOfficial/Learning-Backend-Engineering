// importing express
const express = require('express')
const noteModel = require('./models/Note.model')

// making app
const app = express()

// accepting json data
app.use(express.json())

// get all notes
app.get('/notes', async (req, res) => {
	// fetching all db stored notes
	const notes = await noteModel.find()

	// response back
	res.status(200).json({
		message: 'notes fetched successfully!',
		notes: notes,
	})
})

// create a new note
app.post('/notes', async (req, res) => {
	// extracting client sent data
	const { title, description } = req.body

	// making note obj
	const noteObj = { title, description }

	// creating new note to db
	await noteModel.create(noteObj)

	// response back
	res.status(201).json({
		message: 'note created successfully!',
	})
})

// update a note
app.patch('/notes/:id', async (req, res) => {
	// extracting id
	const { id } = req.params
	const { description } = req.body

	// find & update requested note
	await noteModel.findOneAndUpdate({ _id: id }, { description: description })

	// response back
	res.status(200).json({ message: 'note updated successfully!' })
})

// delete a note
app.delete('/notes/:id', async (req, res) => {
	// extracting id
	const { id } = req.params

	// find & delete requested note
	await noteModel.findOneAndDelete({ _id: id })

	// response back
	res.status(200).json({ message: 'note deleted successfully!' })
})

// exporting app
module.exports = app