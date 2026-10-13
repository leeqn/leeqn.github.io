const BIN_ID = '6ace60e3ffd5d1605367f52b';
const API_KEY = '$2a$10$usYzFIuYVOW9ncp/O66FtOEqbCD1QSjoJzziLoYg1vzj3QYoJC1pm';
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const defaultState = {
    dates: "21.10.2026 -",
    movies: Array.from({ length: 18 }, (_, index) => ({
        id: index + 1,
        title: `FILM TITLE ${index + 1}`,
        lizaScore: '?',
        danyaScore: '?',
        imgSrc: 'blank.png'
    })),
    top5: Array.from({ length: 5 }, (_, index) => ({
        rank: index + 1,
        title: `FILM TITLE`,
        lizaScore: 0,
        danyaScore: 0
    })),
    notes: ['', '', '']
};

let state = { ...defaultState };

const grid = document.getElementById('movieGrid');
const datesText = document.getElementById("datesText");
const top5List = document.getElementById("top5List");
const notesBox = document.querySelector(".notes-box");

async function loadDataFromCloud() {
    try {
        const response = await fetch(`${API_URL}/latest`, {
            method: 'GET',
            headers: { 'X-Master-Key': API_KEY }
        });
        const result = await response.json();

        if (result.record) {
            state.movies = result.record.movies || defaultState.movies;
            state.dates = result.record.dates || defaultState.dates;
            state.top5 = result.record.top5 || defaultState.top5;
            state.notes = result.record.notes || defaultState.notes;

            if (datesText) datesText.textContent = state.dates;
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    } finally {
        renderAll();
    }
}

async function saveDataToCloud() {
    if (datesText) state.dates = datesText.textContent.trim();

    try {
        await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(state)
        });
        console.log('⚡ Данные сохранены в облако!');
    } catch (error) {
        console.error('Ошибка сохранения:', error);
    }
}

function renderAll() {
    renderMovies();
    renderTop5();
    renderNotes();
}

function renderMovies() {
    if (!grid) return;
    grid.innerHTML = state.movies.map((movie, index) => `
        <figure>
            <div class="image-container" data-index="${index}">
                <img src="${movie.imgSrc}" alt="${movie.title}" class="movie-img">
            </div>
            <figcaption>
                <div class="editable title" contenteditable="true" data-index="${index}" data-field="title"><nobr>${movie.title}</nobr></div>
                <div>Liza: <span class="editable" contenteditable="true" data-index="${index}" data-field="lizaScore">${movie.lizaScore}</span>/10</div>
                <div>Danya: <span class="editable" contenteditable="true" data-index="${index}" data-field="danyaScore">${movie.danyaScore}</span>/10</div>
            </figcaption>
        </figure>
    `).join('');
}

function renderTop5() {
    if (!top5List) return;

    const createBoxes = (type, score, index) => {
        const boxes = Array.from({ length: 10 }, (_, i) =>
            `<span data-score="${i + 1}" class="${i < score ? 'active' : ''}"></span>`
        ).join('');
        const nums = Array.from({ length: 10 }, (_, i) => `<span>${i + 1}</span>`).join('');

        return `
            <div class="rating-group">
                <div class="rating-label">${type.toUpperCase()}'S RATING</div>
                <div class="rating-boxes" data-index="${index}" data-user="${type}">${boxes}</div>
                <div class="rating-numbers">${nums}</div>
            </div>
        `;
    };

    top5List.innerHTML = state.top5.map((item, index) => `
        <div class="top5-row">
            <div class="rank-badge">${item.rank}</div>
            <div class="film-title-container">
                <span class="film-title top5-editable" contenteditable="true" data-index="${index}">${item.title}</span>
                <div class="underline"></div>
            </div>
            <div class="ratings-container">
                ${createBoxes('liza', item.lizaScore, index)}
                <div class="rating-divider"></div>
                ${createBoxes('danya', item.danyaScore, index)}
            </div>
        </div>
    `).join('');
}

function renderNotes() {
    if (!notesBox) return;
    const lines = notesBox.querySelectorAll('.notes-line');
    lines.forEach((line, i) => {
        line.textContent = state.notes[i] || '';
    });
}

function initEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.isContentEditable) {
            e.preventDefault();
            e.target.blur();
        }
    });

    if (datesText) {
        datesText.addEventListener('blur', saveDataToCloud);
    }

    if (grid) {
        grid.addEventListener('click', (e) => {
            const container = e.target.closest('.image-container');
            if (container) {
                const index = container.dataset.index;
                const currentUrl = state.movies[index].imgSrc !== 'blank.png' ? state.movies[index].imgSrc : '';
                const newUrl = prompt('Enter image URL:', currentUrl);

                if (newUrl !== null && newUrl.trim() !== '') {
                    state.movies[index].imgSrc = newUrl.trim();
                    renderMovies();
                    saveDataToCloud();
                }
            }
        });

        grid.addEventListener('focusout', (e) => {
            if (e.target.classList.contains('editable')) {
                const index = e.target.dataset.index;
                const field = e.target.dataset.field;
                state.movies[index][field] = e.target.textContent.trim();
                saveDataToCloud();
            }
        });
    }

    if (top5List) {
        top5List.addEventListener('click', (e) => {
            if (e.target.tagName === 'SPAN' && e.target.dataset.score) {
                const group = e.target.closest('.rating-boxes');
                const index = group.dataset.index;
                const user = group.dataset.user;
                const score = parseInt(e.target.dataset.score);

                state.top5[index][`${user}Score`] = score;
                renderTop5();
                saveDataToCloud();
            }
        });

        top5List.addEventListener('focusout', (e) => {
            if (e.target.classList.contains('top5-editable')) {
                const index = e.target.dataset.index;
                state.top5[index].title = e.target.textContent.trim();
                saveDataToCloud();
            }
        });
    }

    if (notesBox) {
        notesBox.addEventListener('focusout', () => {
            const lines = notesBox.querySelectorAll('.notes-line');
            state.notes = Array.from(lines).map(line => line.textContent.trim());
            saveDataToCloud();
        });
    }
}

initEventListeners();
loadDataFromCloud();