const BIN_ID = '6ace60e3ffd5d1605367f52b';
const API_KEY = '$2a$10$usYzFIuYVOW9ncp/O66FtOEqbCD1QSjoJzziLoYg1vzj3QYoJC1pm';

const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const defaultMovies = Array.from({ length: 16 }, (_, index) => ({
    id: index + 1,
    title: `FILM TITLE ${index + 1}`,
    lizaScore: '?',
    danyaScore: '?',
    imgSrc: 'blank.png'
}));

let movies = defaultMovies;
const grid = document.getElementById('movieGrid');
const datesText = document.getElementById("datesText");

async function loadDataFromCloud() {
    try {
        const response = await fetch(`${API_URL}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        const result = await response.json();

        if (result.record) {
            if (result.record.movies) movies = result.record.movies;
            if (result.record.dates && datesText) datesText.textContent = result.record.dates;
        }
    } catch (error) {
        console.error('Ошибка загрузки из облака:', error);
    } finally {
        renderMovies();
    }
}

async function saveDataToCloud() {
    const dates = datesText ? datesText.textContent.trim() : '';

    try {
        await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({
                dates: dates,
                movies: movies
            })
        });
        console.log('Данные успешно сохранены в облако!');
    } catch (error) {
        console.error('Ошибка сохранения в облако:', error);
    }
}

if (datesText) {
    datesText.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            saveDataToCloud();
            datesText.blur();
        }
    });

    datesText.addEventListener("blur", () => {
        saveDataToCloud();
    });
}

function renderMovies() {
    if (!grid) return;
    grid.innerHTML = '';

    movies.forEach((movie, index) => {
        const figure = document.createElement('figure');
        figure.innerHTML = `
            <div class="image-container" data-index="${index}">
                <img src="${movie.imgSrc}" alt="${movie.title}" class="movie-img">
                <div class="upload-badge">Вставить ссылку</div>
            </div>
            <figcaption>
                <div class="editable title" contenteditable="true" data-index="${index}" data-field="title"><nobr>${movie.title}</nobr></div>
                <div>Liza: <span class="editable" contenteditable="true" data-index="${index}" data-field="lizaScore">${movie.lizaScore}</span>/10</div>
                <div>Danya: <span class="editable" contenteditable="true" data-index="${index}" data-field="danyaScore">${movie.danyaScore}</span>/10</div>
            </figcaption>
        `;
        grid.appendChild(figure);
    });

    attachEditListeners();
    attachImageUrlListeners();
}

function attachEditListeners() {
    const editables = grid.querySelectorAll('.editable');

    editables.forEach(element => {
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                element.blur();
            }
        });

        element.addEventListener('blur', () => {
            const index = element.dataset.index;
            const field = element.dataset.field;
            const newValue = element.textContent.trim();

            movies[index][field] = newValue;
            saveDataToCloud();
        });
    });
}

function attachImageUrlListeners() {
    const containers = grid.querySelectorAll('.image-container');

    containers.forEach(container => {
        container.addEventListener('click', () => {
            const index = container.dataset.index;
            const currentUrl = movies[index].imgSrc !== 'blank.png' ? movies[index].imgSrc : '';
            const newUrl = prompt('Enter a valid URL', currentUrl);

            if (newUrl !== null && newUrl.trim() !== '') {
                movies[index].imgSrc = newUrl.trim();
                renderMovies();
                saveDataToCloud();
            }
        });
    });
}

loadDataFromCloud();
