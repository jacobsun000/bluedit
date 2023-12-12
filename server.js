import express from 'express';

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

// mainpage
APP.get(['/', '/main'], (_, res) => {
  res.status(200).render('main');
});

// rest
APP.use((_, res, _next) => {
  res.status(404).render('404');
});

// start server
APP.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
