const API_KEY = "e95671c3f8b18cc4bfc34fd2e123e5b6";
const STORAGE_KEY = "filmid";

let filmid = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const vorm = document.getElementById('filmiVorm');
const nimekiri = document.getElementById('salvestatudFilmid');
const staatusValik = document.getElementById('filmiStaatus');
const timestampVäli = document.getElementById('jarjehoidja');
const filmNimiInput = document.getElementById('filmiNimi');
const datalist = document.getElementById('filmiSoovitaja');

staatusValik.addEventListener('change', function() {
    if (staatusValik.value === "pooleli") {
        timestampVäli.style.display = '';
    } else {
        timestampVäli.style.display = 'none';
    }
});

async function otsiKaanePilt(filminimi){
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(filminimi)}`;
    try{
        const vastus = await fetch(url);
        const andmed = await vastus.json();
        if (andmed.results && andmed.results.length > 0){
            const kaaneURL = andmed.results[0].poster_path;
            return kaaneURL ? `https://image.tmdb.org/t/p/w200${kaaneURL}` : '';
        }
    }
    catch (err){
        console.log("API'ga tekkis mingi viga!", err)
    }
    return '';
}

function kuvaFilmid(){
    nimekiri.innerHTML = '';
    filmid.forEach((film, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="filmikaart">
                <div class="kaartSisu">
                    <div class="kaartEes">
                        ${film.cover ? `<img src="${film.cover}" alt="${film.nimi}">` : ''}
                    </div>
                    <div class="kaartTaga">
                        <h4>${film.nimi}</h4>
                        <h4>${film.reiting}/5</h4>
                        <button class="kustutaBtn" title="Kustuta film" data-index="${index}">×</button>
                    </div>
                </div>
                <div class="kaardiInfo">
                    ${film.staatus}
                    ${film.staatus === 'pooleli' && film.timestamp ? `<br><em>${film.timestamp}</em>` : ''}
                </div>
            </div>
        `;
        li.querySelector('.kustutaBtn').addEventListener('click', () => {
            filmid.splice(index, 1);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filmid));
            kuvaFilmid();
        });

        const kaart = li.querySelector('.filmikaart');
        kaart.querySelector('.kaartSisu').addEventListener('click', () => {
            kaart.classList.toggle('flipped');
        });

        nimekiri.appendChild(li);
    });
}


filmNimiInput.addEventListener('input', async () => {
    const query = filmNimiInput.value.trim();
    if (query.length < 2) {
        datalist.innerHTML = '';
        return;
    }

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        datalist.innerHTML = '';

        data.results.slice(0, 5).forEach(movie => {
            const option = document.createElement('option');
            option.value = movie.title;
            datalist.appendChild(option);
        });
    } catch (err) {
        console.error(err);
    }
});

vorm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nimi = document.getElementById('filmiNimi').value.trim();
    const staatus = staatusValik.value;
    const reiting = document.getElementById('filmiHinnang').value || 0;
    const timestamp = document.getElementById('jarjeHoidja').value.trim();

    if (!nimi) return;

    const cover = await otsiKaanePilt(nimi);

    const uusFilm = {
        nimi,
        staatus,
        reiting,
        timestamp: staatus === 'pooleli' ? timestamp : '',
        cover
    };



    filmid.push(uusFilm);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filmid));
    kuvaFilmid();
    vorm.reset();
    timestampVäli.style.display = 'none';
});

kuvaFilmid();