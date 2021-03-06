let threads = module.exports = {};

// Dependencies
let mongoose = require('mongoose');
let Thread = require('../models/thread');
let _ = require('lodash')
let format = require('date-fns/format')
let {dashes} = require('../test/helpers/decode')
let { CheckPostId, CheckPostTopic, UpdatePostTopic } = require('./util/checkPost')

/**
 * @function {fetches all thread documents}
 */
threads.index = function (req, res, next) {
  Thread.find({})
    .then(data => res.status(200).send(data))
    .catch(next);
};

/**
 * fetches all threads with the given author name
 */
threads.author = function (req, res, next) {
  let author = req.params.author
  Thread.find({'posts.author': {$regex: new RegExp(author, "i")}})
    .then(threads => {
      let posts = threads.map(thread => {
        return thread.posts.filter(post => post.author.toLowerCase() === author.toLowerCase())
      })
      return _.flatten(posts)
    })
    .then(posts => res.send(posts))
    .catch(next)
}

/**
 * @function {returns all documents from the sites given in the sites array}
 */
threads.sites = function (req, res, next) {
  let payload = req.body
  let siteArr = payload.sites
  let topic = payload.topic
  Thread.find({
    'topic': topic,
    'post.site': { $in: siteArr }
  })
  .then(results => {
    if(results.length>0) {
      res.send(results)
    } else {
      res.send({message:'No results'})
    }

  })
  .catch(next)
}

/**
 * @function {creates a new thread document}
 */
threads.create = function (req, res, next) {
  // Validate if thread post uuid already exists
  let payload = req.body
  let uuid = _.get(payload, 'post.uuid')
  let topic = _.get(payload, 'topic')[0]
  let opts = {payload, uuid, topic, req, res, next}

  let checkPostId = new CheckPostId()
  let checkPostTopic = new CheckPostTopic()
  let updatePostTopic = new UpdatePostTopic()  

  checkPostId.setNext(checkPostTopic)
  checkPostTopic.setNext(updatePostTopic)

  return checkPostId.exec(opts)
};

/**
 * @function {fetches all thread documents with topic name provided in req.params.topic}
 */
threads.topic = function (req, res, next) {
  let topic = req.params.topic;
  Thread.find({topic})
    .then(data => res.status(200).send(data))
    .catch(next)
}

/**
 * @function {fetches latest single thread document with topic name provided in req.params.topic}
 */
threads.topicLatest = function (req, res, next) {
  let topic = req.params.topic;
  Thread
    .find({topic})
    .sort({createdAt: -1})
    .limit(1)
    .exec()
    .then(data => res.status(200).send(data))
    .catch(next)
}

/**
 * @function {deletes a single thread document based on id provided in req.params.id}
 */
threads.topicDelete = function (req, res, next) {
  Thread.findByIdAndRemove(req.params.id)
    .then(data => res.send(data))
    .catch(next)
}

/**
 * @function {updates the entire document}
 */
threads.topicUpdate = function (req, res, next) {
  Thread.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(data => {
      let title = _.get(data, 'post.title')
      console.log('updated document: ', title);
      res.send(data)
    })
    .catch(next);
}

threads.topicQuery = function (req, res, next) {
  let topicNameArr = _.castArray(req.query.topic);
  let daysAgo = req.query.daysAgo || 3
  let date = new Date() - (daysAgo * 24 * 60 * 60 * 1000)
  let publishedSince = format(date, 'YYYY-MM-DD')
  let page = req.query.page || 1
  let limit = Number(req.query.limit) || 40
  let skip = limit * (page - 1)
  let findQuery;
  let queryAll = _.includes(topicNameArr, 'all');
  if (queryAll) {
    findQuery = {}
  } else {
    findQuery = {
      "topic": {$in: topicNameArr},
      "post.published": {$gte: publishedSince}
    }
  }
  Thread.find(findQuery,
    {
      "post.social": 0
    })
    .sort({
      "post.published": -1
    })
    .then(data => {
      res.send(data)
    })
    .catch(next)
}

threads.paginate = function (req, res, next) {
  let daysAgo = 30
  let date = new Date() - (daysAgo * 24 * 60 * 60 * 1000)
  let publishedSince = format(date, 'YYYY-MM-DD')
  let page = req.query.page || 1
  let limit = Number(req.query.limit) || 100
  let skip = limit * (page - 1)
  
  let topicName = req.query.topic
  let topicQuery = (!topicName) ? { $exists: true } : topicName

  Thread.find({},{
      "post.social": 0,
      "post.text": 0
    })
    .sort({
      "post.published": -1,
      "topic": 1
    })
    .limit(limit)
    .skip(skip)
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      console.log(err);
    })
}

threads.show = function (req, res, next) {
  let id = req.params.id;
  Thread.findById(id)
    .populate('comments.user', 'email')
    .then(data => {
      res.status(200).send(data)
    })
    .catch(next)
}


threads.article = function (req, res, next) {
  let id = req.params.id;
  Thread.find({_id: id})
  .then(data => {
    if (data.length > 0) {
      res.send(data)
    } else {
      next()
    }
  })
  .catch(next)
}