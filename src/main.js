import express from 'express'
import fs from 'fs'
import {
  getAllPosts, createPost, getPostById, updatePost, deletePost,
} from './db.js'

const app = express()
app.use(express.json())

// Middleware para loggear las peticiones
app.use((req, res, next) => {
  const originalSend = res.send
  let responseBody

  res.send = function (body) {
    responseBody = body
    originalSend.call(this, body)
  }

  res.on('finish', () => {
    const logEntry = `${new Date().toISOString()}, Path: ${req.path}, Method: ${req.method}, Request Payload: ${JSON.stringify(req.body)}, Response: ${responseBody}\n`
    fs.appendFile('log.txt', logEntry, (err) => {
      if (err) {
        console.error('Error writing to log file', err)
      }
    })
  })

  next()
})

// TEST: GET
app.post('/', async (req, res) => {
  res.send('HELLO FROM POST')
})

// GET: Obtener todos los posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await getAllPosts()
    res.status(200).json({ message: 'Posts retrieved', data: posts })
  } catch (err) {
    res.status(500).send('Error retrieving posts')
  }
})

// GET: Obtener un post por id
app.get('/post/:id', async (req, res) => {
  try {
    const post = await getPostById(req.params.id)
    if (post) {
      res.status(200).json({ message: 'Posts retrieved', data: post })
    } else {
      res.status(404).send('Post not found')
    }
  } catch (err) {
    res.status(500).send('Error retrieving post')
  }
})

// POST: Crear un post
app.post('/post', async (req, res) => {
  const { title, content, image } = req.body
  if (!title || !content) {
    res.status(400).send('Title and content are required')
  } else {
    try {
      await createPost(title, content, image)
      res.status(201).send('Post created')
    } catch (err) {
      res.status(500).send('Error creating post')
    }
  }
})

// PUT: Actualizar un post
app.put('/post/:id', async (req, res) => {
  const { title, content, image } = req.body

  if (title === undefined && content === undefined && image === undefined) {
    return res.status(400).send('At least one of title, content, or image must be provided')
  }

  try {
    await updatePost(req.params.id, title, content, image)
    return res.status(200).send('Post updated')
  } catch (err) {
    return res.status(500).send('Error updating post')
  }
})

// DELETE: Borrar un post
app.delete('/post/:id', async (req, res) => {
  try {
    await deletePost(req.params.id)
    res.status(200).send('Post deleted')
  } catch (err) {
    res.status(500).send('Error deleting post')
  }
})

// Rutas no existentes
app.use((req, res) => {
  res.status(400).send('Endpoint not found or incorrect data format')
})

const port = 3001

app.listen(port)
