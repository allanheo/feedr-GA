import { newsKey } from './keys.js';
let newsSources = [
  `https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsKey}`,
  'https://www.reddit.com/top.json'
];

function renderRows(data) {
  
  // Vanilla js way
  let article = document.createElement('article');
  article.innerHTML = `
      <section class="featuredImage">
        <img src="${data.img}" alt="" />
      </section>
      <section class="articleContent">
          <a href="${data.url}"><h3>${data.title}</h3></a>
          <h6>Lifestyle - ${data.author}</h6>
      </section>
      <section class="impressions">
        526
      </section>
      <div class="clearfix"></div>
  `;
  article.classList.add('article')
  document.getElementById('main').appendChild(article);
}

function renderSources(data, i) {

  //console.log(typeof data) --> Object?!?!?!?!?

  // why do i have to do this? why is each element inside newsSources consdiered an object, not a string?
  let string = data + '';
  let splitter = string.split('/');
  let cleanName = splitter[2]

  // Vanilla js way
  let source = document.createElement('li');
  
  // do i need <li></li> again here?
  source.innerHTML = `
    <li id=source${i}><a href="#">${cleanName}</a></li>
  `;
  document.getElementById('sources').appendChild(source);  
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
    //impressions
    //category
  }
  for (let i = 0; i < data.length; i++) {
    let cleanData = [];

    // newsapi
    if(i === 0) {
      data[i].articles.forEach(function(result) {
        cleanData.push(new ArticleObj(result.title, result.author, result.url, result.urlToImage));
      });
      data[i] = cleanData;
    
    // reddit
    } else if(i === 1) {
      data[i].data.children.forEach(function(result) {
        cleanData.push(new ArticleObj(result.data.title, result.data.author, result.data.url, result.data.thumbnail));
      });
      data[i] = cleanData;
    }
  }
  return data;
}

async function init(sources) {
  // step 0 delete all childnodes of "main"
  let parent = document.getElementById('main')
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
  
  // step 1 retrieve data
  let promises = [];
  for (let i = 0; i < sources.length; i++) {
    promises.push(retrieveData(sources[i]));
  }
  
  const newsData = await Promise.all(promises);
  
  // step 2 normalize data
  let cleanData = normalizeData(newsData);
  console.log("this is newsData", newsData)

  // step 3 render to dom
  cleanData.forEach(function(sources) {
    sources.forEach(function(articles) {
      renderRows(articles);
    });
  });

  document.getElementById('sourceName').innerHTML = "Source Name"
}

// not happy about having to duplicate almost every line of init just to accomplish running a single element of cleanData at a time
// this function will only be called when individual sources are clicked
async function initSingle(sources, i) {

  // step 0 delete all childnodes of "main"
  let parent = document.getElementById('main')
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
  
  // step 1 retrieve data
  let promises = [];
  for (let i = 0; i < sources.length; i++) {
    promises.push(retrieveData(sources[i]));
  }
  
  const newsData = await Promise.all(promises);
  
  // step 2 normalize data
  let cleanData = normalizeData(newsData);
  console.log("this is newsData", newsData)

  // step 3 render to dom
  cleanData[i].forEach(function(articles) {
    renderRows(articles);
  });

  // step 4 change source name in search bar
  let string = sources[i] + '';
  let splitter = string.split('/');
  let cleanName = splitter[2]
  document.getElementById('sourceName').innerHTML = cleanName

}

// on page load

// render source list
for (let i = 0; i < newsSources.length; i++) {
  renderSources(newsSources[i], i)
}

// render all news source articles
init(newsSources);

// add event listeners for each source in the drop down
for(let i = 0; i < newsSources.length; i++) {
  // is this just fancy notation? could i have used a normal function notation?
  document.getElementById(`source${i}`).addEventListener('click', () => initSingle(newsSources, i));
}

// add even listener for "Allan"
document.getElementById('home').addEventListener('click', () => init(newsSources));

