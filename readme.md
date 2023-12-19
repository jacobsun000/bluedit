# CSCI4131 Final Project

Jacob Sun

## Project Description

Micro-blogging website built with express.js, pug, and MySql.
Supports:

- User registration and login with **password encryption**
- Posting, deleting, editing, and viewing posts
- Post could include text and image
- Search posts by keywords, and sort.
- Like and unlike posts

## How to run

First tunnel-ssh to cse-lab machines, forward port 3306 to localhost:3306,
and run the following commands:

```bash
npm install && node server.js
```

## Special Notes

- Test screen size is 2560 x 1440, and 3840 x 2160, with no scale.
- Search and sort feature are implemented in the explore page.
- All posts are generated randomly with ChatGPT.
