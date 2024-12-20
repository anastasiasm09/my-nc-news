const db = require('../db/connection');



exports.selectArticleById = (article_id) => {
    let sqlQuery = 'SELECT * FROM articles WHERE article_id = $1';
    const queryValues = [article_id];

    return db.query(sqlQuery, queryValues).then(({ rows }) => {
    if (rows.length === 0) {
        throw { status: 404, msg: 'Article not found' };
    }
    return rows[0];
  });
};

exports.selectArticles = (sort_by = "created_at", order = "ASC", topic) => {
    const validSortBy = [
      "author",
      "title",
      "article_id",
      "topic",
      "created_at",
      "votes",
      "article_img_url",
      "comment_count",
    ];

    const validOrders = ["ASC", "DESC"]
    const queryValues = [];

    if (!validSortBy.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: 'Invalid sort_by query' })
    }

    if (!validOrders.includes(order)) {
        return Promise.reject({ status: 400, msg: 'Invalid order query' })
    }
  
    let sqlQuery = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.article_img_url, articles.votes,
    COUNT(comments.comment_id) AS comment_count
    FROM articles LEFT JOIN comments
    ON articles.article_id = comments.article_id`

    if (topic) {
      sqlQuery += ` WHERE articles.topic = $1`;
      queryValues.push(topic);
    }

    sqlQuery += ` GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order}`;

    return db.query(sqlQuery, queryValues).then(({ rows }) => {
      return rows;
        });
      };

exports.selectComments = (article_id) => {
    const sqlQuery = `
      SELECT comment_id, votes, created_at, author, body, article_id
      FROM comments
      WHERE article_id = $1
      ORDER BY created_at DESC
    `;

    return db.query(sqlQuery, [article_id])
    .then(({ rows }) => {
        return rows;
    })
};

exports.insertComment = (article_id, username, body) => {
    if (!username || !body) {
      return Promise.reject({
        status: 400,
        msg: "Missing required fields: username and body",
      });
    }
  
    return db
      .query('SELECT * FROM articles WHERE article_id = $1', [article_id])
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({ status: 404, msg: "Article not found" });
        }
        return db.query('SELECT * FROM users WHERE username = $1', [username]);
      })
      .then(({ rows: userRows }) => {
        if (userRows.length === 0) {
          return Promise.reject({ status: 404, msg: "User not found" });
        }
        return db.query(
          `INSERT INTO comments (article_id, author, body, votes, created_at)
           VALUES ($1, $2, $3, 0, DEFAULT) RETURNING *`,
          [article_id, username, body]
        );
      })
      .then(({ rows: commentRows }) => {
        return commentRows[0];
      });
};

exports.updateArticleVotes = (article_id, inc_votes) => {
  return db
    .query(
      'UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *',
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.removeCommentById = (comment_id) => {
  return db
    .query(
      'DELETE FROM comments WHERE comment_id = $1 RETURNING *', [
      comment_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    });
};