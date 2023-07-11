import React from 'react';
import './App.css';
import assert from 'assert';
import { setup } from 'axios-cache-adapter';

const api = setup({
  cache: {
    maxAge: 15 * 60 * 1000
  }
})
let articles = {};
async function searchNews(q) {
  q = encodeURIComponent(q);
  // First request will be served from network
  const response = await api.get(`https://gnews.io/api/v4/search?q=${q}&lang=en&country=us&max=10&apikey=0053cf5a0f1cdb0b9404f47c1e0aab98`).then(response => {
  // `response.request` will contain the origin `axios` request object
  articles = response?.data;
  assert.ok(response.request.fromCache !== true)
  }).catch(err => {});
   // Second request to same endpoint will be served from cache
   const anotherResponse = await api.get(`https://gnews.io/api/v4/search?q=${q}&lang=en&country=us&max=10&apikey=0053cf5a0f1cdb0b9404f47c1e0aab98`).then(response => {
    articles = response?.data;
   // `response.request` will contain `fromCache` boolean
   assert.ok(anotherResponse.request.fromCache === true)
}).catch(err => {});
  return articles?.articles;
}

function App() {
  const [query, setQuery] = React.useState("docker");
  const [list, setList] = React.useState(null);
  const search = (e) => {
    e.preventDefault();
    searchNews(query).then(setList);
  };
  return (
    <div className="app">
      <h2>Fetch Articles</h2>
      <form onSubmit={search}>
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button>Search</button>
      </form>
      {!list
        ? null
        : list.length === 0
          ? <p><i>No results</i></p>
          : <ul>
            {list.map((item, i) => (
              <Item key={i} item={item} />
            ))}
          </ul>
      }
    </div>
  );
}

function Item({ item }) {
  const separateWords = s => s.replace(/[A-Z][a-z]+/g, '$& ').trim();
  const formatDate = s => new Date(s).toLocaleDateString(undefined, { dateStyle: 'long' });
  return (
    <li className="item">
      {item.image &&
        <img className="thumbnail"
          alt=""
          src={item?.image}
        />
      }
      <h2 className="title">
        <a href={item?.url}>{item?.title}</a>
      </h2>
      <p className="description">
        {item?.description}
      </p>
      <div className="meta">
        <span>{formatDate(item?.publishedAt)}</span>
        <span className="provider">
          {item?.image &&
            <img className="provider-thumbnail"
              alt=""
              src={item?.image + '&w=16&h=16'}
            />
          }
          {item?.title}
        </span>
        {item?.content &&
          <span>{separateWords(item?.content)}</span>
        }
      </div>
    </li>
  );
}

export default App;
