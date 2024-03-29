const browser = chrome || browser;
const baseURL = 'https://www.reddit.com';
const autocompleteAPI = 'search_reddit_names';

async function getSubredditSuggestions(subreddit) {
  const options = {
    exact: false,
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

browser.omnibox.setDefaultSuggestion({ description: 'Enter the name of a subreddit' });

browser.omnibox.onInputChanged.addListener(async (text, addSuggestions) => {
  addSuggestions(await getSubredditSuggestions(text.trim()));
});

browser.omnibox.onInputEntered.addListener((url, disposition) => {
  const subreddit = url.trim();
  const actionUrl = !subreddit ? baseURL : `${baseURL}/r/${subreddit}/`;
  browser.tabs.update({ url: actionUrl });
});
