// importing express
const express = require('express')

// making server instance & storing it in app
const app = express()

// middleware for accepting json data from client
app.use(express.json())

// notes container array
let notes = []

// route for get all notes
app.get('/notes', (req, res) => {
	res.status(200).json({
		message: 'notes fetched successfully',
		notes: notes,
	})
})

// route for create new note
app.post('/notes', (req, res) => {
	notes.push(req.body)
	res.status(201).json({ message: 'note created successfully!' })
})

// route for update a note's description
app.patch('/notes/:index', (req, res) => {
	const index = req.params.index
	const description = req.body.description

	notes[index].description = description

	res.status(200).json({ message: 'description updated successfully' })
})

// route for delete a note
app.delete('/notes/:index', (req, res) => {
	const index = req.params.index
	notes.splice(index, 1)
	res.status(200).json({ message: 'note deleted successfully' })
})

// exporting app
module.exports = app