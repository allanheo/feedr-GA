import { newsKey } from './keys.js';
let newsSources = [
  'https://www.reddit.com/top.json'
//  `https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsKey}`
  
];

// API Call Examples
// Fetch API Call with chain method
// fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsKey}`, {
//   method: 'GET',
// })
//   .then(response => response.json())
//   .then(json => console.log(json))
//   .catch(err => console.log(err));

// Example provided by News API
// https://newsapi.org/docs/get-started
// var url = 'http://newsapi.org/v2/top-headlines?' +
//           'country=us&' +
//           `apiKey=${newsKey}`;
// var req = new Request(url);
// console.log(req);
// fetch(req)
//   .then((response) => response.json()).then(json => console.log(json))

  
// Async Await Method, example from lesson 9
const fetchThings = async (url) => {
  try {
    // fetch the raw response
    const rawResponse = await fetch(url);

    // fetch only rejects for network error or connection issues

    // as a result, we need to handle different scenarios here
    // rawResponse.ok is true if status code is between 200 - 299
    if (!rawResponse.ok) {
      throw new Error(rawResponse);
    }

    // could also key off status directly
    if (rawResponse.status === 404) {
      throw new Error('Not found');
    }

    // if we made it this far, we're ok
    // parse response into json
    const jsonResponse = await rawResponse.json();

    // now we can do whatever we want with jsonResponse
    // add elements to DOM, make more requests, etc.
    console.log(jsonResponse);
    jsonResponse.articles.forEach(function(result) {
      console.log(result.title);
      renderRows(result.title);
    });
  } catch (err) {
    console.log('err', err);
  }
};
// fetchThings(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsKey}`);


// Reddit API with Proxy
let apiCall = fetch('https://cors.bridged.cc/https://www.reddit.com/top.json');

// apiCall
//   .then(res => res.json())
//   .then(results => {
//     console.log(results.data.children);
//     results.data.children.forEach(function(result){
//       // $('ul').append('<li>'+result.data.title+'</li>')
//       renderRows(result.data.title);
//     });
    
//   })
//   .catch(err => console.log(err));

function renderRows(data) {

  // Vanilla js way
  let article = document.createElement('article');
  article.innerHTML = `
    <article class="article">
      <section class="featuredImage">
        <img src="${data.img}" alt="" />
      </section>
      <section class="articleContent">
          <a href="${data.url}" target="_blank"><h3>${data.title}</h3></a>
          <h6>Author - ${data.author}</h6>
      </section>
      <section class="impressions">
        526
      </section>
      <div class="clearfix"></div>
    </article>
  `;
  document.getElementById('main').appendChild(article);  
  
  // jQuery way
  // $('#main').append(`
  //   <article class="article">
  //     <section class="featuredImage">
  //       <img src="${data.img}" alt="" />
  //     </section>
  //     <section class="articleContent">
  //         <a href="${data.url}"><h3>${data.title}</h3></a>
  //         <h6>Lifestyle - ${data.author}</h6>
  //     </section>
  //     <section class="impressions">
  //       526
  //     </section>
  //     <div class="clearfix"></div>
  //   </article>
  // `);

}

async function retrieveData(url, apiKey) {
  try {
    const rawResponse = await fetch(url);

    if (!rawResponse.ok) {
      throw new Error(rawResponse.message);
    }

    if (rawResponse.status === 404) {
      throw new Error('Not found');
    }

    const jsonResponse = await rawResponse.json();
    console.log(jsonResponse);
    return jsonResponse;
  } catch (err) {
    console.log('err', err);
  }
}

function normalizeData(data) {
  console.log('data', data);
  function ArticleObj(title, author, url, img) {
    this.title = title;
    this.author = author;
    this.url = url;
    this.img = img;
    //for the number on the right
    //this.number = number
  }
  
  for (let i = 0; i < data.length; i++) {
    let cleanData = [];
  
    //hard coded??!?! include comment indicating which if loop is for which source 
    //the first link, reddit
    if(i === 0) {
      data[i].data.children.forEach(function(result) {
        cleanData.push(new ArticleObj(result.data.title, result.data.author, result.data.url, result.data.thumbnail));
      });
      
      // overriding newsData, raw data, with cleanData, an array. 2d array forms here
      data[i] = cleanData;
    }

    //seccond link, the news api
    // else if(i === 1) {
    //   data[i].articles.forEach(function(result) {
    //     cleanData.push(new ArticleObj(result.title, result.author, result.url, result.urlToImage));
    //   });
    //   data[i] = cleanData;
    // }
  }
  return data;
}

async function init(sources) {
  let promises = [];
  for (let i = 0; i < sources.length; i++) {
    promises.push(retrieveData(sources[i]));
  }

  // does this make newsData an array too? 
  const newsData = await Promise.all(promises);

  let cleanData = normalizeData(newsData);

  cleanData.forEach(function(sources) {
    sources.forEach(function(articles) {
      renderRows(articles);
    });
  });
}

init(newsSources);

// call init on
// newsSources, an array with two values, 1. newsapi and 2. reddit
// call retrieve data on each of those newsSources array elements, requires url and apikey, but apikey isn't even passed in or used in the function 
// push retrieve data results into promises[]
// newsData waits on the promises[] data to load?
// cleanData is the result of noramlizeData
// renderrow for each new type
// does this mean all rwos from source 1 will be created, then all rows from source 2?