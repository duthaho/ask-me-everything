const request = require("superagent");
const cheerio = require("cheerio");
const NodeCache = require("node-cache");
const async = require("async");
const parser = require("url-parse")

const nc = new NodeCache();

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:11.0) Gecko/20100101 Firefox/11.0",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:22.0) Gecko/20100 101 Firefox/22.0",
  "Mozilla/5.0 (Windows NT 6.1; rv:11.0) Gecko/20100101 Firefox/11.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_4) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.46 Safari/536.5",
  "Mozilla/5.0 (Windows; Windows NT 6.1) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.46 Safari/536.5",
];
const agentLength = USER_AGENTS.length;

const SCHEME = "https://";
const SEARCH_URLS = {
  bing: (site, query) => `${SCHEME}www.bing.com/search?q=site:${site}%20${query}`,
  google: (site, query) => `${SCHEME}www.google.com/search?q=site:${site}%20${query}`,
  duckduckgo: (site, query) => `${SCHEME}duckduckgo.com/?q=site:${site}%20${query}&t=hj&ia=web`,
};

const BLOCK_INDICATORS = [
  'form id="captcha-form"',
  'This page appears when Google automatically detects requests coming from your computer network which appear to be in violation of the <a href="//www.google.com/policies/terms/">Terms of Service',
];

const BLOCKED_QUESTION_FRAGMENTS = ["webcache.googleusercontent.com", "translate.google.com"];
const blockQuestionLength = BLOCKED_QUESTION_FRAGMENTS.length;

const getSearchUrl = (engine) => SEARCH_URLS[engine] || SEARCH_URLS["google"];

const isBlocked = (page) => BLOCK_INDICATORS.some((i) => page.includes(i));

const isQuestion = (link) => {
  for (let i = 0; i < blockQuestionLength; i++) {
    if (link.includes(BLOCKED_QUESTION_FRAGMENTS[i])) return false;
  }
  return /questions\/\d+/.test(link);
};

const getQuestions = (links) => links.filter((l) => isQuestion(l));

const getResult = (url, cb) => {
  request
    .get(url)
    .set({ "User-Agent": USER_AGENTS[Math.floor(Math.random() * agentLength)] })
    .end((err, res) => {
      if (err) return cb(err);
      cb(null, res.text || res.body);
    });
};

const getLinksWithCache = (payload, cb) => {
  const { q, engine = "google", site = "stackoverflow.com" } = payload;
  const key = `${q}-links`;

  if (nc.has(key)) return cb(null, nc.get(key));

  const query = encodeURIComponent(q);
  const url = getSearchUrl(engine)(site, query);

  getResult(url, (err, result) => {
    if (err) return cb(err);
    if (isBlocked(result)) return cb(null, new Error("Blocked"));
    const $ = cheerio.load(result);
    const links = extractLinks($, engine);
    const questions = getQuestions(links);
    nc.set(key, questions);
    cb(null, questions);
  });
};

const extractLinks = ($, engine) => {
  let links = [];
  if (engine === "google") {
    $(".yuRUbf a").each(function () {
      links.push($(this).attr("href"));
    });
    $(".kCrYT a").each(function () {
      links.push($(this).attr("href"));
    });
    $(".l").each(function () {
      links.push($(this).attr("href"));
    });
    $(".rc a").each(function () {
      links.push($(this).attr("href"));
    });
    $(".r a").each(function () {
      links.push($(this).attr("href"));
    });
  }
  links = links.map(l => cleanGoogleLink(l)).filter(Boolean);
  return links;
};

const cleanGoogleLink = (link) => {
  if (link.includes('/url?')) {
    const query = parser(link, true).query
    return query.q || query.url || link
  }
}

const getAnswerWithCache = (link, cb) => {
  if (nc.has(link)) return cb(null, nc.get(link));

  getResult(`${link}?answertab=votes`, (err, result) => {
    if (err) return cb(err);
    nc.set(link, result);
    cb(null, result);
  });
};

const getAnswer = (link, cb) => {
  getAnswerWithCache(link, (err, result) => {
    if (err) return cb(err);
    const $ = cheerio.load(result);
    const firstAnswer = $(".answercell").first() || $('.answer').first();
    if (firstAnswer) {
      let answerBodyCls = '.post-text'
      if (firstAnswer.find('.js-post-body')) {
        answerBodyCls = '.js-post-body'
      }
      answer = firstAnswer.find(answerBodyCls).text()
    }
    if (!answer) {
      answer = 'no answer given, updating my brain...'
    }
    const vote = $(".answer .js-vote-count").first().text();
    cb(null, { answer, vote, link });
  });
};

const getInstructions = (payload, cb) => {
  getLinksWithCache(payload, (err, questionLinks) => {
    if (err) return cb(err);
    if (!Array.isArray(questionLinks) || questionLinks.length === 0) return cb(null, []);
    let numAnswers = payload.n || 1;
    if (numAnswers > questionLinks.length) numAnswers = questionLinks.length;

    async.map(questionLinks.slice(0, numAnswers), getAnswer, cb);
  });
};

module.exports = {
  getInstructions,
};
