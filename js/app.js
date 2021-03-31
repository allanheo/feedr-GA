// heavy on comments. might be a bit overkill, but i personally can't do without the comments!! 
// when adding new sources, the only hard code required is inside normalizeData
// the source will automatically be listed with this split function
// didn't feel comfortable with all the getelement or getclass by id, but we used it so much for this project, i feel good about it
// really had to be at least familiar with the html and css file, had to search in css file to be familiar, and then google searched


// DON'T FORGET TO LOCALHOST!!!!!!!!!
// for every new newSource, the only functions that needs hard-editing is normalizeData(data)

import { newsKey } from './keys.js';
let newsSources = [
  `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_KEY}`,
  'https://www.reddit.com/top.json',
  `https://api.nytimes.com/svc/topstories/v2/us.json?api-key=${process.env.NYTIMES_KEY}`
  
];
//-------------------------------------------------------------------
function renderRows(data, index) {
  
  // Vanilla js way
  let article = document.createElement('article');
  article.innerHTML = `
      <section class="featuredImage">
        <img id="popUpToggle${index}" src="${data.img}" alt="" />
      </section>
      <section class="articleContent">
          <a href="${data.url}"><h3>${data.title}</h3></a>
          <h6>Author - ${data.author}</h6>
      </section>
      <section class="impressions">
        526
      </section>
      <div class="clearfix"></div>
  `;
  article.classList.add('article')
  document.getElementById('main').appendChild(article);

  // event listener for the icon 
  document.getElementById(`popUpToggle${index}`).addEventListener('click', function onClick() {
    
    // create popup content
    let popUp = document.createElement('div');
    popUp.innerHTML = `
    <a href="#" id="closePopUp">X</a>
      <div class="container">
        <h1>${data.title}</h1>
        <p>
          Article description/content here.
        </p>
        <a href="${data.url}" class="popUpAction" target="_blank">Read more from source</a>
      </div>    
    `
    
    // add this to the popup
    document.getElementById('popUp').appendChild(popUp);
    
    // remove the hidden class to make it show
    document.getElementById('popUp').classList.remove("hidden", "loader");

    // event listener for x button on each pop up
    document.getElementById("closePopUp").addEventListener('click', function onClick() {
    
      // clearing the popup for the next popup to have a clean slate
      
      //*** below will not work bc there's nothing to grab in the document
      // document.getElementById('popUp').removeChild(document.getElementById('popUp').firstChild)
      
      // need to clear the innerHTML for the popup content I just added 
      popUp.innerHTML = ''

      // add hidden class to remove the popup
      document.getElementById('popUp').classList.add("hidden");

    });

  });
  
}
//-------------------------------------------------------------------
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
//-------------------------------------------------------------------
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
    return jsonResponse;
  } catch (err) {
    console.log('err', err);
  }
}
//-------------------------------------------------------------------
function normalizeData(data) {
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
    

    // NYT
    } else if(i === 2) {
      data[i].results.forEach(function(result) {
        cleanData.push(new ArticleObj(result.title, result.byline, result.url, result.multimedia[1].url));
      });
      data[i] = cleanData;
    }

  }
  return data;
}
//-------------------------------------------------------------------
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

  // step 3 render to dom
  cleanData.forEach(function(sources, i) {
    sources.forEach(function(articles, index)  {
      renderRows(articles, i + "" + index);
    });
  });

  document.getElementById('sourceName').innerHTML = ""
}
//-------------------------------------------------------------------
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

  // step 3 render to dom
  cleanData[i].forEach(function(articles) {
    renderRows(articles);
  });

  // step 4 change source name in search bar
  let string = sources[i] + '';
  let splitter = string.split('/');
  let cleanName = splitter[2]
  document.getElementById('sourceName').innerHTML = ": " + cleanName

}
//-----------------------------------main--------------------------------
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

// add event listener for magnifying glass
document.getElementById('search').addEventListener('click', () => {
  if (document.getElementById("sources").style.display === "inherit") {
    document.getElementById("sources").style.display = "";    
  } 
  
  else {
    document.getElementById("sources").style.display = "inherit";
  }
});

// add event listener for "Allan"
document.getElementById('home').addEventListener('click', () => init(newsSources));


// popup toggle for every icon clicked
// renderrows hasn't finished running by the time i'm getting element by class name "popUpToggle"

// console.log(document.getElementsByClassName('popUpToggle'))

// left to do:
// break down functions
// make unique click possible for individual page loads


