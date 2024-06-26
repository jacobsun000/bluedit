import mysqlAwait from 'mysql-await';
import mysql from 'mysql';

var connPool = mysqlAwait.createPool({
  connectionLimit: 5,
  host: "localhost",
  user: 'C4131F23U202',
  database: 'C4131F23U202',
  password: '40854',
});

// var connPool = mysqlAwait.createPool({
//   connectionLimit: 5,
//   host: 'localhost',
//   user: 'root',
//   database: 'CSCI4131',
//   password: 'password',
// });

export class DB {
  constructor() {
    this.connPool = mysqlAwait.createPool({
      connectionLimit: 5,
      host: 'localhost',
      user: 'root',
      database: 'CSCI4131',
      password: 'password',
    });
  }
  async addPost(data) {
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

  async getPost(data) {
    const { id, sortBy, keyword } = data;
    let query = 'SELECT * FROM posts';

    if (id) {
      query += ' WHERE id = ' + mysql.escape(id);
    } else if (keyword) {
      query += ' WHERE title LIKE ' + mysql.escape(keyword) + ' OR body LIKE ' + mysql.escape(keyword);
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

  async editPost(data) {
    if (!data.id) {
      return false;
    }

    const fieldsToUpdate = {};
    if (data.title) fieldsToUpdate.title = data.title;
    if (data.body) fieldsToUpdate.body = data.body;
    if (data.image) fieldsToUpdate.image = data.image;
    if (data.likes) fieldsToUpdate.likes = data.likes;

    if (Object.keys(fieldsToUpdate).length > 0 && !data.likes) {
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

  async delPost(data) {
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

  async addUser(data) {
    if (!data.username || !data.name || !data.password || !data.email) {
      return false;
    }

    const user = {
      username: data.username,
      name: data.name,
      email: data.email,
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

  async getUser(data) {
    let query = 'SELECT * FROM users';
    if (data.id) {
      query += ' WHERE id = ' + mysql.escape(data.id);
    } else if (data.username) {
      query += ' WHERE username = ' + mysql.escape(data.username);
    } else if (data.email) {
      query += ' WHERE email = ' + mysql.escape(data.email);
    }
    else {
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

}
