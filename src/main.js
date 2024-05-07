import express from 'express'
import fs from 'fs'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import cors from 'cors'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
  getAllPosts, createPost, getPostById, updatePost, deletePost, createUser, findUserByUsername
} from './db.js'

const app = express()

const SECRET_KEY = 'your_secret_key'

app.use(express.json())
app.use(cors());

const filename = fileURLToPath(import.meta.url)
const Dirname = dirname(filename)

const swaggerDocument = YAML.load(join(Dirname, '../docs/swagger/swagger.yaml'))

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

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

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
    return res.status(401).json({ authenticated: false, error: 'No token provided' })
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ authenticated: false, error: 'Token is not valid' })
    }
    req.user = user
    next()
  })
}

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
app.get('/posts/:id', async (req, res) => {
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
app.post('/posts', authenticateToken, async (req, res) => {
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
app.put('/posts/:id', authenticateToken, async (req, res) => {
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
app.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    await deletePost(req.params.id)
    res.status(204).send('Post deleted')
  } catch (err) {
    res.status(500).send('Error deleting post')
  }
})

// POST: Crear un usuario
app.post('/register', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).send('Username and password are required')
  }

  try {
    const salt = bcryptjs.genSaltSync(10)
    const hashedPassword = bcryptjs.hashSync(password, salt)
    await createUser(username, hashedPassword)
    res.status(201).send('User created')
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).send('Username already exists')
    } else {
      res.status(500).send('Error creating user')
    }
  }  
})

// POST: Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).send('Username and password are required')
  }

  try {
    const user = await findUserByUsername(username)
    if (user && await bcryptjs.compare(password, user.password)) {
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        SECRET_KEY,
        { expiresIn: '1h' },
      )
      res.status(200).json({ token: token })
    } else {
      res.status(401).send('Invalid credentials')
    }
  } catch (err) {
    res.status(500).send('Server error')
  }
})

// GET: Autenticar usuario
app.get('/auth', authenticateToken, (req, res) => {
  res.status(200).json({
    authenticated: true,
    message: 'Authenticated',
    user: req.user,
  })
})

// Rutas no existentes
app.use((req, res) => {
  res.status(400).send('Endpoint not found')
})

const port = 22281

app.listen(port)
