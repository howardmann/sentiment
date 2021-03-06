let helpers = module.exports = {};

// Dependencies
let _ = require('lodash')
let moment = require('moment')

// TODO: Unit test
/**
 * @function {sorts array payload by unique titles and date published}
 * @param  {Array} array       {array of posts}
 * @param  {String} sortBy  {"descending" otherwise blank will sort ascending}
 * @return {Array} {filtered array of posts}
 */

helpers.sortPayload = (array, sortBy) => {
  // Filter by positive votes and unique post titles
  let plusVotesArr = array.filter(el => el.votes >= 0)
  let uniqPayload = _.uniqBy(plusVotesArr, 'post.title')

  // Sort by most recent published unless query param includes ?sort=descending
  if (sortBy === 'descending') {
    return uniqPayload.sort((a, b) => {
      return (Date.parse(moment(a.post.published).utc().format('YYYY/MM/DD HH:00')) - Date.parse(moment(b.post.published).utc().format('YYYY/MM/DD HH:00'))) || (a.votes - b.votes)
    })
  } else {
    // Sort by votes for the 100 unique posts per page
    return uniqPayload.sort((a, b) => {
      return b.votes - a.votes || moment(b.post.published) - moment(a.post.published)
    })
  }
}

helpers.checkVoteCookie = (req, res, next) => {
  let id = req.params.id
  let voteCookie = _.get(req, 'cookies.vote')
  let hasVoted = _.includes(voteCookie, id)
  if (hasVoted) {
    res.send({message: 'Limit one vote'})
  } else {
    let newCookie = voteCookie || [];
    newCookie.push(id)
    res.cookie('vote', newCookie)
    next()
  }
}

