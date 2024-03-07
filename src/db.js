import conn from './conn.js'

export async function getAllPosts() {
 const [rows] = await conn.query('SELECT * FROM blog_posts')
 return rows
}

export async function createPost(title, content, image) {
    const [result] = await conn.query('INSERT INTO blog_posts (title, content, image) VALUES (?, ?, ?)', [title, content, image])
    return result
 }

export async function getPostById(id) {
    const [rows] = await conn.query('SELECT * FROM blog_posts WHERE id = ?', [id])
    return rows[0]
}

export async function updatePost(id, title, content, image) {
    const [result] = await conn.query('UPDATE blog_posts SET title = ?, content = ?, image = ? WHERE id = ?', [title, content, image, id])
    return result
}

export async function deletePost(id) {
    const [result] = await conn.query('DELETE FROM blog_posts WHERE id = ?', [id])
    return result
}