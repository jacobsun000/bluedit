import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';


import { DB } from './db.js';

const db = new DB();
const app = express();
const PORT = 4131;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: '4457db59e3a05215bd12fa3d755760270d66fc65',
  resave: false,
  saveUninitialized: true
}));

// App settings
app.set('view engine', 'pug');
app.set('views', './templates');
app.use(express.json());
app.use((req, res, next) => {
  const startTime = new Date();
  const logger = () => {
    res.removeListener('finish', logger);
    res.removeListener('close', logger);

    console.log(`Time: ${startTime.toTimeString()}`);
    console.log(`Request: ${req.method} ${req.originalUrl}`);
    console.log(`Response: ${res.statusCode}`);
    console.log(`-------------------`);
  };

  res.on('finish', logger);
  res.on('close', logger);

  next();
});

// Static
app.use(express.static('resources'));

// Utils
function formatBlogsPreview(blogs, pageSize, currentPage) {
  const curr = currentPage || 1;

  const totalBlogs = blogs.length;
  const last = Math.ceil(totalBlogs / pageSize);
  const page = {
    curr,
    last,
    prev: curr > 1 ? curr - 1 : 1,
    next: curr < last ? curr + 1 : last
  };

  let previewBlogs = blogs
    .slice((curr - 1) * pageSize, curr * pageSize)
    .map(blog => ({
      id: blog.id,
      title: blog.title,
      preview: blog.body.length > 100 ? blog.body.substring(0, 100) + '...' : blog.body,
      image: blog.image,
    }));
  return { blogs: previewBlogs, page }
}

async function getLoginUser(req) {
  if (req.session && req.session.userId) {
    let user = await db.getUser({ id: req.session.userId });
    user.password = null;
    return user;
  }
  return null;
}

// Home
app.get('/', async function(req, res) {
  const rawBlogs = await db.getPost({ sortBy: 'newest' });
  const curr = parseInt(req.query.page, 10) || 1;
  const user = await getLoginUser(req);
  const { blogs, page } = formatBlogsPreview(rawBlogs, 6, curr);
  res.render('main', { blogs, page, user });
});

// Explore
app.get('/explore', async function(req, res) {
  const keyword = req.query.search || '';
  const sortBy = req.query.sort || 'newest';
  const curr = parseInt(req.query.page, 10) || 1;
  const rawBlogs = await db.getPost({ keyword, sortBy });
  const user = await getLoginUser(req);
  const { blogs, page } = formatBlogsPreview(rawBlogs, 6, curr);
  res.render('explore', { blogs, page, user });
});

// Blog
app.get('/blog', async function(req, res) {
  const id = parseInt(req.query.id, 10);
  const blogs = await db.getPost({ id });
  if (blogs == null || blogs.length === 0) {
    return res.redirect('/404');
  }
  let blog = blogs[0];
  const author = await db.getUser({ id: blog.userid });
  blog.author = author === null ? 'Unknown' : author.name;
  const user = await getLoginUser(req);
  res.render('blog', { blog, user });
});

// Edit
app.get('/edit', async function(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id) {
    return res.redirect('/404');
  }

  const user = await getLoginUser(req);
  if (!user) {
    return res.redirect('/login');
  }

  const blogs = await db.getPost({ id });
  if (blogs.length === 0 || blogs[0].userid !== user.id) {
    return res.status(403).send('Unauthorized');
  }

  const blog = blogs[0];
  res.render('edit', { blog, user });
});

app.post('/edit', async function(req, res) {
  const blogId = parseInt(req.params.id, 10);
  const { title, body, image } = req.body;

  if (!blogId) {
    return res.redirect('/404');
  }

  const user = await getLoginUser(req);
  if (!user) {
    return res.redirect('/login');
  }

  const originalBlog = await db.getPost({ id: blogId });
  if (originalBlog.length === 0 || originalBlog[0].userid !== user.id) {
    return res.status(403).send('Unauthorized');
  }

  const success = await db.editPost({ id: blogId, title, body, image });
  if (success) {
    res.redirect(`/blog?id=${blogId}`);
  } else {
    res.status(500).send('An error occurred');
  }
});

// Signup
app.get('/signup', (_, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  let { username, name, email, password, image } = req.body;
  password = await bcrypt.hash(password, 8);

  const result = await db.addUser({ username, name, email, password, image });
  if (result) {
    res.redirect('/login');
  } else {
    res.json('Error');
  }
});

// Login
app.get('/login', (req, res) => {
  const message = req.query.error === 'invalid' ? 'Wrong username or password' : null;
  res.render('login', { message });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  let user = await db.getUser({ username });
  if (user === null) {
    user = await db.getUser({ email: username });
  }

  if (user !== null && await bcrypt.compare(password, user.password)) {
    console.log('Login success');
    req.session.userId = user.id;
    res.redirect('/');
  } else {
    res.redirect('/login?error=invalid');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// rest
app.use((_, res, _next) => {
  res.status(404).render('404');
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
