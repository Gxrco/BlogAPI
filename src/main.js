import express from 'express'
import { getAllPosts } from './db.js'
import { createPost } from './db.js'
import { getPostById } from './db.js'
import { updatePost } from './db.js'
import { deletePost } from './db.js'

const app = express()
app.use(express.json())

app.post('/', async (req, res) => {
  res.send('HELLO FROM POST')
})

//GET: Obtener todos los posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await getAllPosts()
    res.status(200).json({ message: 'Posts retrieved', data: posts });
  } catch (err) {
    res.status(500).send('Error retrieving posts')
  }
})

//GET: Obtener un post por id
app.get('/post/:id', async (req, res) => {
  try {
    const post = await getPostById(req.params.id)
    if (post) {
      res.status(200).json({ message: 'Posts retrieved', data: post });
    } else {
      res.status(404).send('Post not found')
    }
  } catch (err) {
    res.status(500).send('Error retrieving post')
  }
})

//POST: Crear un post
app.post('/post', async (req, res) => {
  const {title,content,image} = req.body
  console.log(req.body)
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

//PUT: Actualizar un post
app.put('/post/:id', async (req, res) => {
  const {title,content,image} = req.body
  try {
    await updatePost(req.params.id, title, content, image)
    res.status(200).send('Post updated')
  } catch (err) {
    res.status(500).send('Error updating post')
  }
})

//DELETE: Borrar un post
app.delete('/post/:id', async (req, res) => {
  try {
    await deletePost(req.params.id)
    res.status(200).send('Post deleted')
  } catch (err) {
    res.status(500).send('Error deleting post')
  }
})

const port = 3001

app.listen(port, () => {
  console.log(`Server listening at http://127.0.0.1:${port}`)
})