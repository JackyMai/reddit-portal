const browser = chrome || browser;
const baseURL = 'https://www.reddit.com';
const autocompleteAPI = 'search_reddit_names';

async function getSubredditSuggestions(text) {
  const response = await fetch(`${baseURL}/api/${autocompleteAPI}.json?query=${text}`);
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
  addSuggestions(await getSubredditSuggestions(text));
});

browser.omnibox.onInputEntered.addListener((url, disposition) => {
  const subredditURL = `${baseURL}/r/${url}/`;
  switch (disposition) {
    case 'currentTab':
      browser.tabs.update({ url: subredditURL });
      break;
    case 'newForegroundTab':
      browser.tabs.create({ url: subredditURL });
      break;
    case 'newBackgroundTab':
      browser.tabs.create({ url: subredditURL, active: false });
      break;
  }
});