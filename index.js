const defaultMovies = Array.from({ length: 16 }, (_, index) => ({
    id: index + 1,
    title: `FILM TITLE ${index + 1}`,
    lizaScore: '?',
    danyaScore: '?',
    imgSrc: 'blank.png'
}));

let movies = JSON.parse(localStorage.getItem('movieCollection')) || defaultMovies;

const grid = document.getElementById('movieGrid');
const datesText = document.getElementById("datesText");

if (datesText) {
    const savedDates = localStorage.getItem("marathonDates");

    if (savedDates) {
        datesText.textContent = savedDates;
    }

    function saveDates() {
        const currentText = datesText.textContent.trim();
        localStorage.setItem("marathonDates", currentText);
    }

    datesText.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            saveDates();
            datesText.blur();
        }
    });

    datesText.addEventListener("blur", () => {
        saveDates();
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
                <div class="upload-badge"></div>
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
            saveToLocalStorage();
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
                saveToLocalStorage();
                renderMovies();
            }
        });
    });
}

function saveToLocalStorage() {
    localStorage.setItem('movieCollection', JSON.stringify(movies));
}

renderMovies();