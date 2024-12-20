const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const {
  psqlErrorHandler,
  customErrorHandler,
  serverErrorHandler,
} = require("./errors");
const getApi = require('./controllers/api.controller');
const getTopics = require('./controllers/topics.controller');
const getUsers = require('./controllers/users.controller');

const { getArticleById, getArticles, getComments, postCommentByArticleID, patchArticleVotes, deleteCommentById } = require('./controllers/articles.controller');

app.use(express.json());

app.get("/api", getApi);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getComments);

app.post("/api/articles/:article_id/comments", postCommentByArticleID);

app.patch("/api/articles/:article_id", patchArticleVotes);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.get("/api/users", getUsers);


app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(serverErrorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

module.exports = app;