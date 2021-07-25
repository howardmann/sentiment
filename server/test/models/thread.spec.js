// Testing libraries
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
Company.Online
Company.Online.Word
Company.Online.Luxury
FB.Company
Company_FB
Company.Luxury

// Helpers
let format = require('date-fns/format')
let seeder = require('../helpers/seeder.js');

// App requires
let server = require('../../server.js');
let mongoose = require('mongoose');
let Thread = require('../../models/thread');


describe('thread', function () {
  beforeEach('drop the collection and reseed database', function (done) {
    mongoose.connection.collections.threads.drop(function () {
      seeder.threads(done)
    });
  });

  it('should return all the threads on GET /threads/all', function (done) {
    chai.request(server)
      .get('/threads/all')
      .end(function (err, resp) {
        let input = resp.body.map(el => {
          return Object.assign({}, {
            topic: el.topic,
            createdAt: format(el.createdAt, 'YYYY')
          })
        })
        let actual = [
          {topic: ['bitcoin'], createdAt: '2018'},
          {topic: ['gold'], createdAt: '2018' },
          {topic: ['monero'], createdAt: '2018' }
        ]
        expect(input).to.deep.include.members(actual);
        done();
      })
  });

  it('should return a single doc on GET /threads/topic/id/:id', function(done){
    chai.request(server)
    .get('/threads/all')
    .end(function (err, resp) {
      let sampleId = resp.body[0]._id;

      chai.request(server)
        .get(`/threads/topic/id/${sampleId}`)
        .end(function (err, resp) {
          let input = resp.body._id
          let actual = sampleId
          expect(input).to.equal(actual)
          done();
        })
    })
  })

  it('should return error message if no doc exists with that id on GET /threads/topic/id/:id', function(done){
    chai.request(server)
      .get('/threads/topic/id/123')
      .end(function(err, resp){
        expect(resp.status).to.equal(422)
        expect(resp.body.error).to.equal('Cast to ObjectId failed for value "123" at path "_id" for model "Thread"')
        done()
      })
  })

  it('should add a single thread on POST /threads', function (done) {
    let post = {
      uuid: "c677c138dcad7393cc5609590c34576d408f8b6c",
      site: "thestreet.com",
      url: "http://omgili.com/ri/jHIAmI4hxg.uirYnf46ccQYSWX9yPpewflRULc2uSxrfppfBAYFoUrE4j2nmpgcR5kR.6Wb4EJEggSTJeEBOvmHQcCLJ33b8uzgW7Ta5yX25SZ6tcknc07Z6D9cSvkUpL6RvV0z4zwRCtQTIiYaUbfO9losXvQ.f",
      author: "Brian O'Connell",
      published: "2017-08-25T22:42:00.000+03:00",
      title: "Bitcoin Investors, Beware: The IRS Is Coming for Your Vast Riches",
      crawled: "2017-08-25T22:08:28.006+03:00",
      text: "Uncle Sam has Bitcoin traders on the radar these days, as the cryptocurrency passes $4,300 in late August trading.\nWith more assets pouring into digital currencies, the federal government, via the Internal Revenue Service , is looking to get its fair share from Bitcoin -- a cut that the IRS doesn't believe it's been getting until now.\nThat could change, and fast, as the IRS is using a software program that monitors Bitcoin-based digital addresses, in a campaign to identify potential tax evaders.\nUsing a customized software program from Chainalysis, a blockchain data analysis firm in New York C..."
    }

    chai.request(server)
      .post('/threads')
      .send({topic: ['banana boat'], post})
      .end(function (err, resp) {
        let data = resp.body;
        expect(data).to.have.all.keys(['__v', '_id', 'updatedAt', 'createdAt', 'post', 'topic', 'votes', 'comments']);
        expect(data.topic).to.eql(['banana boat']);
        expect(data.post).to.eql(post);
        expect(data.votes).to.eql(0);
        done();
      })
  });

  it('should validate if the post uuid already exists with same topic before creating thread via POST /threads', function(done){
    let posts = require('../data/posts.json');
    let post = posts[1];
    chai.request(server)
      .post('/threads')
      .send({ topic: ['bitcoin'], post })
      .end(function (err, resp) {
        let input = resp.body;
        let actual = {
          message: 'Post already exists'
        }
        expect(input).to.eql(actual)
        done();
      })
  })

  it('should update if the post uuid already exists but topic is different via POST /threads', function(done){
    let posts = require('../data/posts.json');
    let post = posts[1];
    chai.request(server)
      .post('/threads')
      .send({ topic: ['fatcat'], post })
      .end(function (err, resp) {
        let input = resp.body.topic;
        let actual = ['bitcoin', 'crypto', 'fatcat']
        expect(input).to.eql(actual)
        done();
      })
  })

  it('should return all topic threads on GET /threads/topic/:topic', function (done) {
    chai.request(server)
      .get('/threads/topic/bitcoin')
      .end(function (err, resp) {
        let input = resp.body.map(el => {
          return Object.assign({}, {
            topic: el.topic,
            createdAt: format(el.createdAt, 'YYYY')
          })
        })
        let actual = [
          { topic: ['bitcoin'], createdAt: '2018' },
          { topic: ['bitcoin'], createdAt: '2018' },
        ]
        expect(input).to.deep.include.members(actual);
        done();
      })
  });

  it('should return the latest topic thread on GET /threads/topic/:topic/latest', function (done) {
    chai.request(server)
      .get('/threads/topic/bitcoin/latest')
      .end(function (err, resp) {
        expect(resp.body.length).to.equal(1);
        let data = resp.body[0];
        let topic = data.topic;
        let post = data.post;
        let posts = require('../data/posts.json');
        let actual = posts[1]

        expect(topic).to.eql(['bitcoin', 'crypto']);
        expect(post).to.eql(actual);
        done();
      })
  });

  it('should return all relevant site documents when passed an array of sites via POST /threads/sites', function (done) {
    chai.request(server)
      .post('/threads/sites')
      .send({topic: 'bitcoin', sites: ['businessinsider.com']})
      .end(function (err, resp) {
        let input = resp.body[0].post.site;
        let actual = 'businessinsider.com'
        expect(input).to.equal(actual)
        done()
      })
  })

  it('should delete a topic by id on DELETE /threads/topic/id/:id', function (done) {
    Thread
      .findOne({topic: 'monero' })
      .then(data => {
        let id = data.id;
        chai.request(server)
          .delete(`/threads/topic/id/${id}`)
          .end(function (err, resp) {
            expect(resp.body.topic).to.eql(['monero']);
            chai.request(server)
              .get('/threads/topic/monero')
              .end(function( err, resp){
                expect(resp.body.length).to.equal(0);
                done();
              })
          })
      })
  });

  it('should update a topic by id on PUT /threads/topic/id/:id', function (done) {
    Thread
      .findOne({topic: 'bitcoin' })
      .then(data => {
        let id = data.id;
        let document = { topic: ['miaow'], post: { title: 'cat hero' } }

        chai.request(server)
          .put(`/threads/topic/id/${id}`)
          .send(document)
          .end(function (err, resp) {
            expect(resp.body.topic).to.eql(['miaow']);
            expect(resp.body.post).to.eql(document.post);
            done();
          })
      })
  });

  it('should update a topic with given votes on PUT /threads/topic/id/:id', function (done) {
    Thread
    .findOne({topic: 'bitcoin' })
    .then(data => {
      let id = data.id;

      chai.request(server)
        .put(`/threads/topic/id/${id}`)
        .send({post: {title: 'optional'}, votes: 1})
        .end(function (err, resp) {
          expect(resp.body.topic).to.eql(['bitcoin'])
          expect(resp.body.votes).to.equal(1)
          done();
        })
    })
  })

  it.only('should update a sentiment score on PUT /threads/topic/id/:id', function (done) {
    Thread
    .findOne({topic: 'bitcoin' })
    .then(data => {
      let id = data.id;

      chai.request(server)
        .put(`/threads/topic/id/${id}`)
        .send({documentSentiment: {score: 1.0}})
        .end(function (err, resp) {
          expect(resp.body.topic).to.eql(['bitcoin'])
          expect(resp.body.documentSentiment.score).to.equal(1)
          console.log(resp.body);
          done();
        })
    })
  })


  it('should find all topics by topic name and published since on GET /threads/topic/query?topic=name%20daysAgo=number', function (done) {
    chai.request(server)
      .get('/threads/topic/query?topic=crypto&topic=bitcoin&daysAgo=300')
      .end(function (err, resp) {
        expect(resp.body[0].topic).to.eql(['bitcoin', 'crypto'])
        done()
      })
  })  

})
