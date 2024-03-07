import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: 'localhost',
  user: 'gerco',
  database: 'blog_db',
  password: '1234',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

pool.getConnection()
  .then((connection) => {
    console.log('Connected to MySQL database successfully')
    connection.release()
  })
  .catch((error) => {
    console.error('Error connecting to MySQL database:', error)
    process.exit(1)
  })

export default pool
