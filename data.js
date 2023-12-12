import mysql from 'mysql-await';

var connPool = mysql.createPool({
  connectionLimit: 5,
  host: 'localhost',
  user: 'root',
  database: 'CSCI4131',
  password: 'password',
});

export async function addPost(data) {
  if (!data.title || !data.body || !data.userid) {
    return false;
  }

  const post = {
    userid: data.userid,
    title: data.title,
    body: data.body,
    image: data.image || null
  };

  try {
    await connPool.awaitQuery('INSERT INTO posts SET ?', post);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getPost(data) {
  const { id, sortBy, keyword } = data;
  let query = 'SELECT * FROM posts';

  if (id) {
    query += ' WHERE id = ' + connPool.escape(id);
  } else if (keyword) {
    query += ` WHERE title LIKE '%${keyword}%' OR body LIKE '%${keyword}%'`;
  } else if (sortBy) {
    if (sortBy === 'newest') {
      query += ' ORDER BY updated_at DESC';
    } else if (sortBy === 'oldest') {
      query += ' ORDER BY updated_at ASC';
    } else if (sortBy === 'likes') {
      query += ' ORDER BY likes DESC';
    } else {
      return [];
    }
  } else {
    return [];
  }

  try {
    const results = await connPool.awaitQuery(query);
    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function editPost(data) {
  if (!data.id) {
    return false;
  }

  const fieldsToUpdate = {};
  if (data.title) fieldsToUpdate.title = data.title;
  if (data.body) fieldsToUpdate.body = data.body;
  if (data.image) fieldsToUpdate.image = data.image;

  if (Object.keys(fieldsToUpdate).length > 0) {
    fieldsToUpdate.updated_at = new Date();
  }

  try {
    await connPool.awaitQuery('UPDATE posts SET ? WHERE id = ?', [fieldsToUpdate, data.id]);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function delPost(data) {
  if (!data.id) {
    return false;
  }

  try {
    await connPool.awaitQuery('DELETE FROM posts WHERE id = ?', [data.id]);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function addUser(data) {
  if (!data.username || !data.name || !data.password) {
    return false;
  }

  const user = {
    username: data.username,
    name: data.name,
    password: data.password,
    image: data.image || null
  };

  try {
    await connPool.awaitQuery('INSERT INTO users SET ?', user);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getUser(data) {
  let query = 'SELECT * FROM users';
  if (data.id) {
    query += ' WHERE id = ' + connPool.escape(data.id);
  } else if (data.username) {
    query += ' WHERE username = ' + connPool.escape(data.username);
  } else {
    return null;
  }

  try {
    const results = await connPool.awaitQuery(query);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
