const express = require('express');
const app = express();
const {
  psqlErrorHandler,
  customErrorHandler,
  serverErrorHandler,
} = require("./errors");
const { getApi, getTopics } = require('./controllers/api.controller');
const { getArticleById, getArticles, getComments } = require('./controllers/articles.controller');


app.get('/api', getApi);
app.get('/api/topics', getTopics);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getComments);


app.use(express.json());
app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(serverErrorHandler);

module.exports = app;