
// Хранилище избранного в localStorage
let favorites = JSON.parse(localStorage.getItem('filmFavorites')) || [];

document.addEventListener('DOMContentLoaded', function() {
    
    // Обновляем счетчик при загрузке
    updateFavoriteCounter();
    
    // Обновляем все сердечки на странице
    updateAllFavoriteButtons();
    
    // Мобильное меню
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navCollapse = document.getElementById('navbarNav');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            navCollapse.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Закрытие алертов
    document.querySelectorAll('.alert-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.alert').remove();
        });
    });
    
    // Модальное окно избранного
    const modal = document.getElementById('favorites-modal');
    const showFavoritesBtn = document.getElementById('show-favorites-btn');
    const closeModalBtn = document.getElementById('close-modal');
    
    if (showFavoritesBtn) {
        showFavoritesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openFavoritesModal();
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeFavoritesModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeFavoritesModal();
            }
        });
    }
    
    // Делегирование событий для кнопок избранного
    document.addEventListener('click', function(e) {
        const favBtn = e.target.closest('.favorite-btn');
        if (favBtn) {
            e.preventDefault();
            const filmId = parseInt(favBtn.dataset.filmId);
            toggleFavorite(filmId, favBtn);
        }
        
        // Кнопка удаления в модальном окне
        const removeBtn = e.target.closest('.remove-favorite');
        if (removeBtn) {
            e.preventDefault();
            const filmId = parseInt(removeBtn.dataset.filmId);
            removeFromFavorites(filmId, removeBtn.closest('.favorite-item'));
        }
    });
    
    // Сброс фильтров
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            const form = document.getElementById('filter-form');
            if (form) {
                form.reset();
                form.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    // Инициализируем модальное окно трейлера
});

// ========== ФУНКЦИИ ИЗБРАННОГО ==========

function toggleFavorite(filmId, button) {
    const index = favorites.indexOf(filmId);
    
    if (index === -1) {
        favorites.push(filmId);
        updateFavoriteButton(button, true);
        showNotification('Добавлено в избранное', 'success');
        
        button.style.animation = 'heartBeat 0.5s';
        setTimeout(() => {
            button.style.animation = '';
        }, 500);
    } else {
        favorites.splice(index, 1);
        updateFavoriteButton(button, false);
        showNotification('Удалено из избранного', 'success');
    }
    
    localStorage.setItem('filmFavorites', JSON.stringify(favorites));
    updateFavoriteCounter();
    
    document.querySelectorAll(`.favorite-btn[data-film-id="${filmId}"]`).forEach(btn => {
        updateFavoriteButton(btn, index === -1);
    });
}

function removeFromFavorites(filmId, itemElement) {
    const index = favorites.indexOf(filmId);
    if (index !== -1) {
        favorites.splice(index, 1);
        localStorage.setItem('filmFavorites', JSON.stringify(favorites));
        
        itemElement.style.transition = 'all 0.3s';
        itemElement.style.opacity = '0';
        itemElement.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            itemElement.remove();
            
            const grid = document.querySelector('.favorites-grid');
            if (grid && grid.children.length === 0) {
                const content = document.getElementById('favorites-modal-content');
                if (content) {
                    content.innerHTML = `
                        <div class="empty-favorites">
                            <i class="far fa-heart"></i>
                            <h3>У вас пока нет избранных фильмов</h3>
                            <p>Добавляйте фильмы в избранное, нажимая на сердечко</p>
                            <a href="/" class="btn btn-primary">Найти фильмы</a>
                        </div>
                    `;
                }
            }
        }, 300);
        
        document.querySelectorAll(`.favorite-btn[data-film-id="${filmId}"]`).forEach(btn => {
            updateFavoriteButton(btn, false);
        });
        
        updateFavoriteCounter();
        showNotification('Удалено из избранного', 'success');
    }
}

function updateFavoriteButton(button, isFavorite) {
    const icon = button.querySelector('i');
    if (icon) {
        if (isFavorite) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            button.classList.add('active');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            button.classList.remove('active');
        }
    }
}

function updateAllFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const filmId = parseInt(btn.dataset.filmId);
        const isFavorite = favorites.includes(filmId);
        updateFavoriteButton(btn, isFavorite);
    });
}

function updateFavoriteCounter() {
    const counter = document.getElementById('favorite-counter');
    if (counter) {
        counter.textContent = favorites.length;
    }
}

function openFavoritesModal() {
    const modal = document.getElementById('favorites-modal');
    const content = document.getElementById('favorites-modal-content');
    
    if (!modal || !content) return;
    
    modal.style.display = 'flex';
    content.innerHTML = '<div class="loader-spinner"><i class="fas fa-spinner fa-spin"></i> Загрузка...</div>';
    
    const url = new URL('/get-favorites/', window.location.origin);
    favorites.forEach(id => {
        url.searchParams.append('ids[]', id);
    });
    
    fetch(url, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        content.innerHTML = data.html;
    })
    .catch(error => {
        console.error('Error:', error);
        content.innerHTML = '<p class="error">Ошибка загрузки избранного</p>';
    });
}

function closeFavoritesModal() {
    const modal = document.getElementById('favorites-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ========== УВЕДОМЛЕНИЯ ==========

function showNotification(message, type = 'info') {
    let container = document.querySelector('.messages-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'messages-container';
        const mainContainer = document.querySelector('.main-content .container');
        if (mainContainer) {
            mainContainer.prepend(container);
        }
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="alert-close">&times;</button>
    `;
    
    if (container) {
        container.appendChild(alert);
    }
    
    const closeBtn = alert.querySelector('.alert-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            alert.remove();
        });
    }
    
    setTimeout(() => {
        alert.style.transition = 'opacity 0.5s';
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 500);
    }, 3000);
}

// ========== ДИНАМИЧЕСКИЙ ПОИСК ==========

function setupFilmSearch() {
    const form = document.getElementById('filter-form');
    const container = document.getElementById('films-grid-container');
    const countSpan = document.getElementById('results-count');
    const loader = document.getElementById('global-loader');
    
    if (!form || !container) return;
    
    const inputs = form.querySelectorAll('input, select');
    let timeoutId;
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                form.dispatchEvent(new Event('submit'));
            }, 500);
        });
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const url = new URL(window.location.href);
        url.search = new URLSearchParams(formData).toString();
        
        window.history.pushState({}, '', url);
        
        if (loader) loader.style.display = 'flex';
        
        fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            container.innerHTML = data.html;
            if (countSpan) {
                countSpan.textContent = `(${data.count})`;
            }
            updateAllFavoriteButtons();
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<p class="error">Произошла ошибка при загрузке</p>';
        })
        .finally(() => {
            if (loader) loader.style.display = 'none';
        });
    });
}

// ========== МОДАЛЬНОЕ ОКНО ТРЕЙЛЕРА ==========

function initTrailerModal() {
    console.log(' initTrailerModal вызвана');
    
    const modal = document.getElementById('trailer-modal');
    const trailerBtn = document.querySelector('.trailer-btn');
    const closeBtn = document.getElementById('close-trailer-modal');
    const filmTitleSpan = document.getElementById('film-title-placeholder');
    const video = document.getElementById('trailer-video');
    
    console.log('modal:', !!modal, 'btn:', !!trailerBtn);
    
    if (!modal || !trailerBtn) {
        console.error(' Элементы трейлера не найдены!');
        return;
    }
    
    let originalSrc = video ? video.src : '';
    
    trailerBtn.addEventListener('click', function() {
        console.log('🎬 Кнопка трейлера нажата');
        const filmTitle = this.dataset.filmTitle;
        if (filmTitleSpan) filmTitleSpan.textContent = filmTitle;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        if (video && video.tagName === 'IFRAME') {
            video.src = '';
            setTimeout(() => { video.src = originalSrc; }, 50);
        }
    });
    
    function closeTrailerModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        if (video && video.tagName === 'IFRAME') {
            const src = video.src;
            video.src = '';
            setTimeout(() => { video.src = src.replace('autoplay=1', 'autoplay=0'); }, 50);
        }
    }
    
    if (closeBtn) closeBtn.addEventListener('click', closeTrailerModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeTrailerModal();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') closeTrailerModal();
    });
    
    console.log('✅ Обработчики трейлера добавлены');
}

// Делаем функцию глобально доступной
window.initTrailerModal = initTrailerModal;



//Колесо фортуны


// Данные фильмов
let wheelFilms = [];
let selectedFilmId = null;

// Элементы колеса
let wheel = null;
let spinner = null;
let trigger = null;
let ticker = null;

// Параметры колеса
let prizeSlice = 45;
let prizeOffset = 0;
const spinClass = "is-spinning";
const selectedClass = "selected";
let spinnerStyles = null;

// Переменные анимации
let tickerAnim = null;
let rotation = 0;
let currentSlice = 0;
let prizeNodes = [];

// Цвета для секторов
const cinemaColors = [
    'hsl(350 80% 35%)',  
    'hsl(0 0% 12%)',      
    'hsl(350 80% 35%)',   
    'hsl(0 0% 12%)',      
    'hsl(350 80% 35%)',   
    'hsl(0 0% 12%)',      
    'hsl(350 80% 35%)', 
    'hsl(0 0% 12%)',    
    'hsl(350 80% 35%)',   
    'hsl(0 0% 12%)',      
    'hsl(350 80% 35%)',   
    'hsl(0 0% 12%)',      
];

// Случайное число
function spinertia(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Инициализация
function initWheelOfFortune() {
    const randomFilmBtn = document.getElementById('random-film-btn');
    const wheelModal = document.getElementById('wheel-modal');
    const closeWheelBtn = document.getElementById('close-wheel-modal');
    
    if (!randomFilmBtn || !wheelModal) return;
    
    randomFilmBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loadFilmsForWheel();
        wheelModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        const resultDiv = document.getElementById('wheel-result');
        if (resultDiv) resultDiv.style.display = 'none';
        
        // Получаем элементы колеса
        wheel = document.querySelector('.deal-wheel');
        spinner = document.querySelector('.wheel-spinner');
        trigger = document.getElementById('spin-wheel-btn');
        ticker = wheel ? wheel.querySelector('.ticker') : null;
        
        if (spinner) {
            spinnerStyles = window.getComputedStyle(spinner);
        }
        
        // Сбрасываем колесо
        rotation = 0;
        currentSlice = 0;
        
        if (tickerAnim) {
            cancelAnimationFrame(tickerAnim);
            tickerAnim = null;
        }
        
        if (wheel) wheel.classList.remove(spinClass);
        if (spinner) spinner.style.setProperty('--rotate', 0);
        if (ticker) ticker.style.animation = 'none';
        
        if (prizeNodes) {
            prizeNodes.forEach(prize => prize.classList.remove(selectedClass));
        }
        
        if (trigger) trigger.disabled = false;
    });
    
    if (closeWheelBtn) {
        closeWheelBtn.addEventListener('click', function() {
            wheelModal.style.display = 'none';
            document.body.style.overflow = '';
            if (tickerAnim) {
                cancelAnimationFrame(tickerAnim);
                tickerAnim = null;
            }
        });
    }
    
    wheelModal.addEventListener('click', function(e) {
        if (e.target === wheelModal) {
            wheelModal.style.display = 'none';
            document.body.style.overflow = '';
            if (tickerAnim) {
                cancelAnimationFrame(tickerAnim);
                tickerAnim = null;
            }
        }
    });
}

// Загрузка фильмов
async function loadFilmsForWheel() {
    try {
        const response = await fetch('/get-films-for-wheel/');
        const data = await response.json();
        wheelFilms = data.films;
        
        while (wheelFilms.length < 6) {
            wheelFilms.push({
                id: null, title: '➕ Добавьте фильм',
                producer_name: 'В библиотеке',
                publication_year: new Date().getFullYear(),
                rating: 0, cover_image: null
            });
        }
        
        wheelFilms = wheelFilms.map((film, i) => ({
            ...film, color: cinemaColors[i % cinemaColors.length]
        }));
        
        setupWheel();
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        wheelFilms = [];
        for (let i = 0; i < 6; i++) {
            wheelFilms.push({
                id: null, title: '🎬 Добавьте фильмы',
                producer_name: 'Кинопоиск', publication_year: 2025,
                rating: 10, cover_image: null,
                color: cinemaColors[i % cinemaColors.length]
            });
        }
        setupWheel();
    }
}

// Настройка колеса
function setupWheel() {
    if (!spinner) return;
    
    prizeSlice = 360 / wheelFilms.length;
    prizeOffset = Math.floor(180 / wheelFilms.length);
    
    spinner.innerHTML = '';
    
    // Создаём градиент
    const gradientColors = wheelFilms.map((film, i) => 
        `${film.color} 0 ${(100 / wheelFilms.length) * (wheelFilms.length - i)}%`
    ).reverse().join(', ');
    
    spinner.setAttribute('style', `background: conic-gradient(from -90deg, ${gradientColors});`);
    
    // Создаём текст на секторах
    wheelFilms.forEach((film, i) => {
        const rot = ((prizeSlice * i) * -1) - prizeOffset;
        let shortTitle = film.title;
        if (film.title.length > 18) shortTitle = film.title.substring(0, 15) + '...';
        
        spinner.insertAdjacentHTML('beforeend',
            `<li class="wheel-prize" data-film-id="${film.id || ''}" style="--rotate: ${rot}deg">
                <span class="text">${shortTitle}</span>
            </li>`
        );
    });
    
    prizeNodes = document.querySelectorAll('.wheel-prize');
    spinnerStyles = window.getComputedStyle(spinner);
    
    // Анимация язычка
    const runTickerAnimation = () => {
        const animate = () => {
            const transform = spinnerStyles.transform;
            
            if (transform && transform !== 'none') {
                const values = transform.split('(')[1].split(')')[0].split(',');
                const a = parseFloat(values[0]);
                const b = parseFloat(values[1]);
                
                if (!isNaN(a) && !isNaN(b)) {
                    let rad = Math.atan2(b, a);
                    if (rad < 0) rad += (2 * Math.PI);
                    
                    const angle = Math.round(rad * (180 / Math.PI));
                    const slice = Math.floor(angle / prizeSlice);
                    
                    if (currentSlice !== slice) {
                        if (ticker) {
                            ticker.style.animation = 'none';
                            setTimeout(() => ticker.style.animation = null, 10);
                        }
                        currentSlice = slice;
                    }
                }
            }
            
            tickerAnim = requestAnimationFrame(animate);
        };
        
        animate();
    };
    
    // Выбор приза
    const selectPrize = () => {
        const selected = Math.floor(rotation / prizeSlice) % wheelFilms.length;
        
        prizeNodes.forEach((prize, i) => {
            prize.classList.remove(selectedClass);
            if (i === selected) prize.classList.add(selectedClass);
        });
        
        const selectedFilm = wheelFilms[selected];
        
        if (selectedFilm && selectedFilm.id) {
            showWheelResult(selectedFilm);
        } else {
            const resultDiv = document.getElementById('wheel-result');
            if (resultDiv) {
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = `
                    <h3>🎬 Добавьте больше фильмов!</h3>
                    <p>В вашей библиотеке пока мало фильмов.</p>
                    <a href="/films/create/" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Добавить фильм
                    </a>
                `;
            }
        }
    };
    
    // Обработчик кнопки
    if (trigger) {
        const newTrigger = trigger.cloneNode(true);
        trigger.parentNode.replaceChild(newTrigger, trigger);
        trigger = newTrigger;
        
        trigger.addEventListener('click', () => {
            if (!wheel || !spinner) return;
            
            trigger.disabled = true;
            rotation = Math.floor(Math.random() * 360 + spinertia(2000, 5000));
            
            prizeNodes.forEach(prize => prize.classList.remove(selectedClass));
            
            const resultDiv = document.getElementById('wheel-result');
            if (resultDiv) resultDiv.style.display = 'none';
            
            wheel.classList.add(spinClass);
            spinner.style.setProperty('--rotate', rotation);
            
            if (ticker) ticker.style.animation = 'none';
            
            runTickerAnimation();
        });
    }
    
    // Обработчик окончания анимации
    spinner.addEventListener('transitionend', () => {
        cancelAnimationFrame(tickerAnim);
        rotation %= 360;
        selectPrize();
        wheel.classList.remove(spinClass);
        spinner.style.setProperty('--rotate', rotation);
        trigger.disabled = false;
    });
    
    // Сброс
    rotation = 0;
    currentSlice = 0;
    if (wheel) wheel.classList.remove(spinClass);
    spinner.style.setProperty('--rotate', 0);
    if (ticker) ticker.style.animation = 'none';
    if (trigger) trigger.disabled = false;
}

// Показ результата
function showWheelResult(film) {
    selectedFilmId = film.id;
    
    const resultDiv = document.getElementById('wheel-result');
    const watchBtn = document.getElementById('watch-selected-film');
    
    if (!resultDiv) return;
    
    // Создаём содержимое
    let posterHtml = film.cover_image 
        ? `<img src="${film.cover_image}" alt="${film.title}">`
        : `<div class="no-poster-small"><i class="fas fa-film"></i></div>`;
    
    // Находим или создаём контейнер для информации
    let selectedFilmInfo = document.getElementById('selected-film-info');
    if (!selectedFilmInfo) {
        selectedFilmInfo = document.createElement('div');
        selectedFilmInfo.id = 'selected-film-info';
        const h3 = resultDiv.querySelector('h3');
        h3.insertAdjacentElement('afterend', selectedFilmInfo);
    }
    
    selectedFilmInfo.innerHTML = `
        <div class="selected-film">
            ${posterHtml}
            <div class="selected-film-info">
                <h4>${film.title}</h4>
                <p><i class="fas fa-user"></i> ${film.producer_name || 'Неизвестен'}</p>
                <p><i class="fas fa-calendar"></i> ${film.publication_year || '—'}</p>
                <p><i class="fas fa-star"></i> ${film.rating || '0'}/10</p>
            </div>
        </div>
    `;
    
    resultDiv.style.display = 'block';
    
    if (watchBtn) watchBtn.href = `/films/${film.id}/`;
}

document.addEventListener('DOMContentLoaded', initWheelOfFortune);