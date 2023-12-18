import express from 'express';
import { DB } from './db.js';

const db = new DB();
const APP = express();
const PORT = 4131;

// app settings
APP.set('view engine', 'pug');
APP.set('views', './templates');
APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));
APP.use((req, res, next) => {
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

// home
APP.get('/', async function(req, res) {
  const blogs = await db.getPost({ sortBy: 'newest' });
  const curr = parseInt(req.query.page, 10) || 1;

  res.render('main', formatBlogsPreview(blogs, 6, curr));
});

// explore
APP.get('/explore', async function(req, res) {
  const keyword = req.query.search || '';
  const sortBy = req.query.sort || 'newest';
  const curr = parseInt(req.query.page, 10) || 1;
  const blogs = await db.getPost({ keyword, sortBy });

  res.render('explore', formatBlogsPreview(blogs, 6, curr));
});

// rest
APP.use((_, res, _next) => {
  res.status(404).render('404');
});

// start server
APP.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
