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
      title: blog.title,
      preview: blog.body.length > 100 ? blog.body.substring(0, 100) + '...' : blog.body,
      image: blog.image,
    }));
  return { blogs: previewBlogs, page }
}

// Home
app.get('/', async function(req, res) {
  const blogs = await db.getPost({ sortBy: 'newest' });
  const curr = parseInt(req.query.page, 10) || 1;

  res.render('main', formatBlogsPreview(blogs, 6, curr));
});

// Explore
app.get('/explore', async function(req, res) {
  const keyword = req.query.search || '';
  const sortBy = req.query.sort || 'newest';
  const curr = parseInt(req.query.page, 10) || 1;
  const blogs = await db.getPost({ keyword, sortBy });

  res.render('explore', formatBlogsPreview(blogs, 6, curr));
});

// Signup
app.get('/signup', (_, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  let { username, name, email, password, image } = req.body;
  password = await bcrypt.hash(password, 8);

  console.log(username, name, email, password, image);
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
