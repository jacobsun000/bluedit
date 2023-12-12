import express from 'express';

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
  { 'id': 1, 'title': "Blog 1", 'text': "Content 1" },
  { 'id': 2, 'title': "Blog 2", 'text': "Content 2" },
  { 'id': 3, 'title': "Blog 3", 'text': "Content 3" },
  { 'id': 4, 'title': "Blog 4", 'text': "Content 4" },
  { 'id': 5, 'title': "Blog 5", 'text': "Content 5" },
  { 'id': 6, 'title': "Blog 6", 'text': "Content 6" },
  { 'id': 7, 'title': "Blog 7", 'text': "Content 7" },
  { 'id': 8, 'title': "Blog 8", 'text': "Content 8" },
];

// mainpage
APP.get('/', function(req, res) {
  const pageSize = 2;
  const totalBlogs = 8;

  const curr = parseInt(req.query.page, 10) || 1;
  const last = Math.ceil(totalBlogs / pageSize);
  const page = {
    curr: curr,
    last: last,
    prev: curr > 1 ? curr - 1 : 1,
    next: curr < last ? curr + 1 : last
  };

  res.render('main', { blogs: blogs, page: page });
});

APP.get('/explore', function(req, res) {
  let searchText = req.query.search || '';
  let sort = req.query.sort || 'date';

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
