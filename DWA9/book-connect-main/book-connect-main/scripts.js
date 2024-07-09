// Initial data setup and validation
let matches = books;
let page = 1;

if (!books || !Array.isArray(books)) throw new Error('Source required');
if (!range || range.length < 2) throw new Error('Range must be an array with two numbers');

// Theme setup
const day = {
  dark: '10, 10, 20',
  light: '255, 255, 255',
};

const night = {
  dark: '255, 255, 255',
  light: '10, 10, 20',
};

const fragment = document.createDocumentFragment();
const extracted = books.slice(0, 36);

for (let i = 0; i < extracted.length; i++) {
  const { author, image, title, id } = extracted[i];
  const preview = document.createElement('book-preview');
  preview.setAttribute('author', author);
  preview.setAttribute('image', image);
  preview.setAttribute('title', title);
  preview.setAttribute('id', id);

  fragment.appendChild(preview);
}

document.querySelector('[data-list-items]').appendChild(fragment);

// Genre dropdown setup
const genresFragment = document.createDocumentFragment();
let element = document.createElement('option');
element.value = 'any';
element.innerText = 'All Genres';
genresFragment.appendChild(element);

for (const [id, name] of Object.entries(genres)) {
  element = document.createElement('option');
  element.value = id;
  element.innerText = name;
  genresFragment.appendChild(element);
}

document.querySelector('[data-search-genres]').appendChild(genresFragment);

// Author dropdown setup
const authorsFragment = document.createDocumentFragment();
element = document.createElement('option');
element.value = 'any';
element.innerText = 'All Authors';
authorsFragment.appendChild(element);

for (const [id, name] of Object.entries(authors)) {
  element = document.createElement('option');
  element.value = id;
  element.innerText = name;
  authorsFragment.appendChild(element);
}

document.querySelector('[data-search-authors]').appendChild(authorsFragment);

// Theme setting based on user preference
const prefersDarkScheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = prefersDarkScheme ? 'night' : 'day';
document.documentElement.style.setProperty('--color-dark', theme === 'night' ? night.dark : day.dark);
document.documentElement.style.setProperty('--color-light', theme === 'night' ? night.light : day.light);

// Show more button setup
const BOOKS_PER_PAGE = 36; // Assuming the books per page is 36
const dataListButton = document.querySelector('[data-list-button]');
dataListButton.innerHTML = `<span>Show more</span><span class="list__remaining"> (${matches.length - page * BOOKS_PER_PAGE})</span>`;
dataListButton.disabled = !(matches.length - page * BOOKS_PER_PAGE > 0);

// Search and settings form and button event listeners
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
  document.querySelector('[data-search-overlay]').open = false;
});

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
  document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const settings = Object.fromEntries(formData);
  document.documentElement.style.setProperty('--color-dark', settings.theme === 'night' ? night.dark : day.dark);
  document.documentElement.style.setProperty('--color-light', settings.theme === 'night' ? night.light : day.light);
  document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-list-close]').addEventListener('click', () => {
  document.querySelector('[data-list-active]').open = false;
});

dataListButton.addEventListener('click', () => {
  const fragment = document.createDocumentFragment();
  const extracted = matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE);
  
  for (const { author, image, title, id } of extracted) {
    const preview = document.createElement('book-preview');
    preview.setAttribute('author', author);
    preview.setAttribute('image', image);
    preview.setAttribute('title', title);
    preview.setAttribute('id', id);
    fragment.appendChild(preview);
  }

  document.querySelector('[data-list-items]').appendChild(fragment);
  page += 1;
  const initial = matches.length - page * BOOKS_PER_PAGE;
  const remaining = initial > 0 ? initial : 0;
  dataListButton.disabled = initial <= 0;

  dataListButton.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${remaining})</span>
  `;
});

document.querySelector('[data-header-search]').addEventListener('click', () => {
  document.querySelector('[data-search-overlay]').open = true;
  document.querySelector('[data-search-title]').focus();
});

document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  let result = [];

  for (const book of books) {
    const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
    const authorMatch = filters.author === 'any' || book.author === filters.author;
    let genreMatch = filters.genre === 'any';

    for (const genre of book.genres) {
      if (genre === filters.genre) {
        genreMatch = true;
        break;
      }
    }

    if (titleMatch && authorMatch && genreMatch) {
      result.push(book);
    }
  }

  if (result.length < 1) {
    document.querySelector('[data-list-message]').classList.add('list__message_show');
  } else {
    document.querySelector('[data-list-message]').classList.remove('list__message_show');
  }

  document.querySelector('[data-list-items]').innerHTML = '';
  const fragment = document.createDocumentFragment();
  const extracted = result.slice(range[0], range[1]);

  for (const { author, image, title, id } of extracted) {
    const preview = document.createElement('book-preview');
    preview.setAttribute('author', author);
    preview.setAttribute('image', image);
    preview.setAttribute('title', title);
    preview.setAttribute('id', id);
    fragment.appendChild(preview);
  }

  document.querySelector('[data-list-items]').appendChild(fragment);
  const initial = matches.length - page * BOOKS_PER_PAGE;
  const remaining = initial > 0 ? initial : 0;
  dataListButton.disabled = initial <= 0;

  dataListButton.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${remaining})</span>
  `;

  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelector('[data-search-overlay]').open = false;
});

// Handling list item click
document.querySelector('[data-list-items]').addEventListener('click', (event) => {
  const pathArray = Array.from(event.composedPath());
  let active = null;

  for (const node of pathArray) {
    const previewId = node?.dataset?.preview;
    if (previewId) {
      active = books.find(book => book.id === previewId);
      if (active) break;
    }
  }

  if (!active) return;

  document.querySelector('[data-list-active]').open = true;
  document.querySelector('[data-list-blur]').src = active.image;
  document.querySelector('[data-list-image]').src = active.image;
  document.querySelector('[data-list-title]').innerText = active.title;
  document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
  document.querySelector('[data-list-description]').innerText = active.description;
});
