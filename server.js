import express from 'express';
import { DB } from './db.js';

const APP = express();
const PORT = 4131;

// app settings
APP.set('view engine', 'pug');
APP.set('views', './templates');
APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));
APP.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
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

// static files
APP.use(express.static('resources'));

const blogs = [
  { 'id': 1, 'title': "Blog 1", 'body': "Content 1" },
  { 'id': 2, 'title': "Blog 2", 'body': "Content 2" },
  { 'id': 3, 'title': "Blog 3", 'body': "Content 3" },
  { 'id': 4, 'title': "Blog 4", 'body': "Content 4" },
  { 'id': 5, 'title': "Blog 5", 'body': "Content 5" },
  { 'id': 6, 'title': "Blog 6", 'body': "Content 6" },
  { 'id': 7, 'title': "Blog 7", 'body': "Content 7" },
  { 'id': 8, 'title': "Blog 8", 'body': "Content 8" },
];

// home
APP.get('/', async function(req, res) {
  const pageSize = 2;
  const curr = parseInt(req.query.page, 10) || 1;
  // let blogs = await db.getPost({ sortBy: 'newest' });

  const totalBlogs = blogs.length;
  const last = Math.ceil(totalBlogs / pageSize);
  const page = {
    curr,
    last,
    prev: curr > 1 ? curr - 1 : 1,
    next: curr < last ? curr + 1 : last
  };

  let blogs_ = blogs.slice((curr - 1) * pageSize, curr * pageSize);

  const previewBlogs = blogs_.map(blog => ({
    title: blog.title,
    body: blog.body.length > 100 ? blog.body.substring(0, 100) + '...' : blog.body,
    image: blog.image,
  }));

  res.render('main', { blogs: previewBlogs, page });
});

// explore
APP.get('/explore', function(req, res) {
  let searchText = req.query.search || '';
  let sort = req.query.sort || 'newest';

  const pageSize = 2;
  let totalBlogs = 8;

  let curr = parseInt(req.query.page, 10) || 1;
  const last = Math.ceil(totalBlogs / pageSize);
  const page = {
    curr: curr,
    last: last,
    prev: curr > 1 ? curr - 1 : 1,
    next: curr < last ? curr + 1 : last
  };

  res.render('explore', { blogs, page });
});

// rest
APP.use((_, res, _next) => {
  res.status(404).render('404');
});

// start server
APP.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
