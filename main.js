const browser = chrome || browser;
const baseURL = 'https://www.reddit.com';
const autocompleteAPI = 'search_reddit_names';

async function getSubredditSuggestions(subreddit) {
  let isExact = false;

  if (subreddit[0] === '!') {
    subreddit = subreddit.substring(1);
    isExact = true;
  }

  if (subreddit[0] === '"' && subreddit[subreddit.length - 1] === '"') {
    subreddit = subreddit.substring(1, subreddit.length - 1);
    isExact = true;
  }

  const options = {
    exact: isExact,
    include_over_18: false,
    include_advertisable: false
  };

  const params = Object.keys(options).reduce(
    (accumulator, key) => `${accumulator}&${key}=${options[key]}`,
    `query=${subreddit}`
  );

  const response = await fetch(`${baseURL}/api/${autocompleteAPI}.json?${params}`);
  const data = await response.json();

  return data.names.map(name => ({
    content: name,
    description: `r/${name}`
  }));
}

browser.omnibox.setDefaultSuggestion({
  description: 'Enter the name of a subreddit'
});

browser.omnibox.onInputChanged.addListener(async (text, addSuggestions) => {
  addSuggestions(await getSubredditSuggestions(text.trim()));
});

browser.omnibox.onInputEntered.addListener((url, disposition) => {
  const subreddit = url.trim();
  const actionUrl = !subreddit ? baseURL : `${baseURL}/r/${subreddit}/`;

  switch (disposition) {
    case 'currentTab':
      browser.tabs.update({ url: actionUrl });
      break;
    case 'newForegroundTab':
      browser.tabs.create({ url: actionUrl });
      break;
    case 'newBackgroundTab':
      browser.tabs.create({ url: actionUrl, active: false });
      break;
  }
});
