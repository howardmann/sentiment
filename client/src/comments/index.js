let data = [{
    id: 1,
    days_ago: 8,
    created_at: "25/1/18",
    updated_at: "",
    thread_id: "abc",
    comment_id: null,
    user_id: "eggbrain",
    text: "If you model your site after Hacker News, people are going to try to use it like Hacker News, and the expected behavior of your site is incredibly not-hacker-news-like.\n1. I click on a story expecting for it to take me to the site, but nothing happens. After feeling confused, I realize it actually added some text content after the story. What? It was only after looking in the comments here that I realized I had to click the link in parentheses (which on Hacker News shows you submissions from that website, not links you to the content)\n\n2. I see a lot of \"points\", so I try to understand how things are upvoted - is it accounts? No, no accounts for your site. Is it based on the links popularity (eg trending tweets, hot news, hot reddit stories, etc)? No, there are some stories with hundreds of points, but linking to a reddit post with 2 upvotes. It's only then do I realize by clicking on the title, or the link, I'm \"up-voting\" it, even though it might not be good content (and in fact, each time I click it adds a point).\n\n3. I search for the ability to comment, but realize that's not there, but again since it looks like Hacker News I think there's comments and go to click on something that doesn't exist.\n\nIn general, I think your site could be really useful, and there's a lot of cool stuff you did, but I'd either change your design so people don't treat your site (interaction wise) like the site your referencing, or try to at least link up expected behavior in a more consistent way."
  },
  {
    id: 2,
    days_ago: 7,
    created_at: "26/1/18",
    updated_at: "",
    thread_id: "abc",
    comment_id: "1",
    user_id: "howiem",
    text: "Thanks for your comments. This is very much an early prototype and I appreciate your comments. I will be looking to add the ability to comment next. Regarding adding text at the bottom I thought it might be easier for people to read a glimpse of text before deciding to open the link, I’ve found this useful in my own browsing. The actual link has a 5 second redirect because I am using the free tier currently for webhose.io api (a great news scraping provider). if I get enough traction I may look at getting a paid account, but this is very much a side project"
  },
  {
    id: 3,
    days_ago: 8.5,
    created_at: "24/1/18",
    updated_at: "",
    thread_id: "abc",
    comment_id: null,
    user_id: "Moter8",
    text: "I can't middleclick links. Unusable for me.\nAlso, please don't attach /?sort=new (or remove it) to reddit threads. It overrides the user's sorting"
  },
  {
    id: 4,
    days_ago: 8,
    created_at: "25/1/18",
    updated_at: "",
    thread_id: "abc",
    comment_id: "3",
    user_id: "akerro",
    text: "I almost liked it, but then I wanted to open 5 links in new tabs and it didn't work, also left-click also doesnt work, it just tries to load some information from external source, only reddit link worked \"OK\" (but really not OK, I wanted to see comments not content of a post) for me."
  },
  {
    id: 5,
    days_ago: 8,
    created_at: "25/1/18",
    updated_at: "",
    thread_id: "abc",
    comment_id: "3",
    user_id: "dmm",
    text: "HN works great without js. This site I can't even click the links?"
  },
  {
    id: 6,
    days_ago: 9,
    created_at: "24/1/18",
    updated_at: "",
    thread_id: "abc",
    comment_id: "5",
    user_id: "czechdeveloper",
    text: "Inspired by HN without all the thinks that makes HN great."
  },
  {
    id: 7,
    days_ago: 8.6,
    created_at: "24/1/18",
    updated_at: "",
    thread_id: "abc",
    comment_id: "3",
    user_id: "4lun",
    text: "Not just middle click, I can’t long press on mobile in order to open a new tab either. I suspect it’s just a <div> element with an onclick handler."
  },
  {
    id: 8,
    days_ago: 8,
    created_at: "25/1/18",
    updated_at: "",
    thread_id: "abc",
    comment_id: "3",
    user_id: "optimuspaul",
    text: "what does a middleclick do?"
  },
  {
    id: 9,
    days_ago: 8,
    created_at: "25/1/18",
    updated_at: "",
    thread_id: "abc",
    comment_id: "8",
    user_id: "jtokoph",
    text: "In most browsers, middle clicking a link will open in a new tab."
  },
  {
    id: 10,
    days_ago: 7,
    created_at: "26/1/18",
    updated_at: "",
    thread_id: "abc",
    comment_id: "9",
    user_id: "bringtheaction",
    text: "Furthermore, middle click a tab to close it. Faster and easier than hitting the small cross in the corner of the tab."
  },
  {
    id: 11,
    days_ago: 6,
    created_at: "27/1/18",
    updated_at: "",
    thread_id: "abc",
    comment_id: "10",
    user_id: "Advaith",
    text: "'middle click a tab to close it' makes things much smoother for me!"
  },
  {
    id: 12,
    days_ago: 9,
    created_at: "24/1/18",
    updated_at: "",
    thread_id: "abc",
    comment_id: null,
    user_id: "sickcodebruh",
    text: "One of the reasons I love Hacker News is because of the high quality of content and discussion. Looking like HN is nice but the fact that your top post includes a nice little \"(((bankers)))\" remark from /u/BigNuts881 was a rough reminder that this isn't to be a much better than just looking through the results of a broad Twitter search."
  },
  {
    id: 13,
    days_ago: 10,
    created_at: "23/1/18",
    updated_at: "",
    thread_id: "abc",
    comment_id: null,
    user_id: "howiem",
    text: "I built this using the webhose api to scrape and filter for cryptocurrency related topics from reputable news sources and trending forum posts. I'm a terrible designer so I eyeballed the hacker news layout and finger painted some CSS over it. Hope people find it interesting :P"
  }
]

// Dependencies
let _ = require('lodash')
let util = require('util')

let comment = data[0]

let renderComment = (comment, indent) => {
  let {user_id, days_ago, text} = comment
  return `
  <div class="indent-${indent}">
    <p>${user_id} ${days_ago} days ago</p>
    <p>${text}</p>
  </div>
  `
}

let renderComments = (commentArr) => {
  return commentArr.map(comment => renderComment(comment)).join(' ')
}

let getParents = (commentArr) => {
  let parentComments = commentArr.filter(el => !el.comment_id)
  return _.sortBy(parentComments, 'created_at').reverse()
}

let hasChildren = (arr, parentId) => {
  let children = arr.filter(comment => comment.comment_id == parentId)
  if (children.length) { return true}
  return false
}

let getNestedChildren = (arr, parentId) => {
  let output = arr.map(comment => {
    if (comment.comment_id == parentId) {
      let children = getNestedChildren(arr, comment.id)
      if (children.length) {
        comment.children = children
      }
      return comment
    }
    return false
  }).filter(Boolean)
  
  return _.sortBy(output, 'created_at').reverse()
}

let magic = (arr) => {
  let parents = getParents(arr)
  return parents.map(el => {
    if(hasChildren(arr, el.id)) {
      return getNestedChildren(arr, el.id)[0]
    } else {
      return el
    }
  })
}
let x = magic(data)
// let x = getNestedChildren(data, 3)
console.log(util.inspect(x,false, null));

