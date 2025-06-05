document.addEventListener('DOMContentLoaded', function() {
    const userLink = document.getElementById('user-link');
    const librarianLink = document.getElementById('librarian-link');
    const libraryLogo = document.getElementById('library-logo');
    const userLoginForm = document.getElementById('user-login-form');
    const librarianLoginForm = document.getElementById('librarian-login-form');

    function resetForm(form) {
        form.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
    }

    if (userLink && librarianLink) {
        userLink.addEventListener('click', function(event) {
            event.preventDefault();
            userLoginForm.style.display = 'block';
            librarianLoginForm.style.display = 'none';
            resetForm(userLoginForm);
            toggleBlur(true);
        });

        librarianLink.addEventListener('click', function(event) {
            event.preventDefault();
            librarianLoginForm.style.display = 'block';
            userLoginForm.style.display = 'none';
            resetForm(librarianLoginForm);
            toggleBlur(true);
        });
    }

    if (libraryLogo) {
        libraryLogo.addEventListener('click', function(event) {
            event.preventDefault();
            if (userLoginForm && librarianLoginForm) {
                userLoginForm.style.display = 'none';
                librarianLoginForm.style.display = 'none';
                resetForm(userLoginForm);
                resetForm(librarianLoginForm);
                toggleBlur(false);
            }
            window.location.href = '/';
        });
    }

    function toggleBlur(isBlurred) {
        const contentWrapper = document.querySelector('.content-wrapper');
        const header = document.querySelector('header');
        const body = document.body;

        if (isBlurred) {
            contentWrapper.classList.add('blur-background');
            header.classList.add('blur-background');
            body.classList.add('no-scroll');
        } else {
            contentWrapper.classList.remove('blur-background');
            header.classList.remove('blur-background');
            body.classList.remove('no-scroll');
        }
    }

    document.getElementById('close-librarian-login').addEventListener('click', function() {
        librarianLoginForm.style.display = 'none';
        toggleBlur(false);
    });

    document.getElementById('close-user-login').addEventListener('click', function() {
        userLoginForm.style.display = 'none';
        toggleBlur(false);
    });

    // Main Slider functionality
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    const indicators = document.querySelectorAll('.indicator');
    let currentIndex = 0;

    function showSlide(index) {
        currentIndex = index;
        if (index >= slides.length) {
            currentIndex = 0;
        } else if (index < 0) {
            currentIndex = slides.length - 1;
        }
        const translateX = currentIndex * -100;
        slider.style.transform = `translateX(${translateX}%)`;
        updateIndicators();
    }

    function updateIndicators() {
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }

    prevBtn.addEventListener('click', () => {
        showSlide(currentIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
        showSlide(currentIndex + 1);
    });

    indicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            showSlide(parseInt(indicator.getAttribute('data-target')));
        });
    });

    setInterval(() => {
        showSlide(currentIndex + 1);
    }, 8000);

    updateIndicators();

    // Most Read Books Slider functionality
    const mostReadSlider = document.querySelector('.most-read-slider');
    const mostReadPrevBtn = document.querySelector('.most-read-prev');
    const mostReadNextBtn = document.querySelector('.most-read-next');
    const mostReadIndicatorsContainer = document.querySelector('.most-read-indicators');
    let mostReadCurrentIndex = 0;
    let totalBookSlides = 0;
    const booksPerView = 4; // Number of books visible at a time

    function fetchMostReadBooks() {
        fetch('/get_book_list')
            .then(response => response.json())
            .then(books => {
                const sortedBooks = books.sort((a, b) => (b.read_count || 0) - (a.read_count || 0)).slice(0, 8);
                mostReadSlider.innerHTML = '';
                mostReadIndicatorsContainer.innerHTML = '';

                sortedBooks.forEach((book, index) => {
                    const slide = document.createElement('div');
                    slide.className = 'most-read-slide';
                    const bookCard = document.createElement('div');
                    bookCard.className = 'book-card';
                    bookCard.innerHTML = `
                        <img src="${book.img ? 'data:image/jpeg;base64,' + book.img : '/static/images/default_book.jpg'}" alt="${book.book_name}">
                        <h3>${book.book_name}</h3>
                        <p>${book.authors}</p>
                        <p>${book.genre} | ${book.publicationyear}</p>
                    `;
                    slide.appendChild(bookCard);
                    mostReadSlider.appendChild(slide);
                });

                totalBookSlides = sortedBooks.length;
                const maxIndicators = Math.max(0, totalBookSlides - booksPerView + 1);
                for (let i = 0; i < maxIndicators; i++) {
                    const indicator = document.createElement('div');
                    indicator.className = 'most-read-indicator';
                    indicator.setAttribute('data-target', i);
                    mostReadIndicatorsContainer.appendChild(indicator);
                }

                updateMostReadSlider();

                const mostReadIndicators = document.querySelectorAll('.most-read-indicator');
                mostReadIndicators.forEach(indicator => {
                    indicator.addEventListener('click', () => {
                        showMostReadSlide(parseInt(indicator.getAttribute('data-target')));
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching most read books:', error);
                showNotification('Failed to load most read books.', 'error');
            });
    }

    function showMostReadSlide(index) {
        const maxIndex = Math.max(0, totalBookSlides - booksPerView);
        mostReadCurrentIndex = index;
        if (index > maxIndex) {
            mostReadCurrentIndex = 0;
        } else if (index < 0) {
            mostReadCurrentIndex = maxIndex;
        }
        const translateX = mostReadCurrentIndex * -25; // Shift by 25% (one book)
        mostReadSlider.style.transform = `translateX(${translateX}%)`;
        updateMostReadIndicators();
    }

    function updateMostReadIndicators() {
        const mostReadIndicators = document.querySelectorAll('.most-read-indicator');
        mostReadIndicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === mostReadCurrentIndex);
        });
    }

    mostReadPrevBtn.addEventListener('click', () => {
        showMostReadSlide(mostReadCurrentIndex - 1);
    });

    mostReadNextBtn.addEventListener('click', () => {
        showMostReadSlide(mostReadCurrentIndex + 1);
    });

    setInterval(() => {
        showMostReadSlide(mostReadCurrentIndex + 1);
    }, 10000);

    function updateMostReadSlider() {
        updateMostReadIndicators();
    }

    fetchMostReadBooks();

    // Most Read Authors Slider functionality
    const mostReadAuthorsSlider = document.querySelector('.most-read-authors-slider');
    const mostReadAuthorsPrevBtn = document.querySelector('.most-read-authors-prev');
    const mostReadAuthorsNextBtn = document.querySelector('.most-read-authors-next');
    const mostReadAuthorsIndicatorsContainer = document.querySelector('.most-read-authors-indicators');
    let mostReadAuthorsCurrentIndex = 0;
    let totalAuthorSlides = 0;
    const authorsPerView = 4; // Number of authors visible at a time

    function fetchMostReadAuthors() {
        fetch('/get_most_read_authors')
            .then(response => response.json())
            .then(authors => {
                mostReadAuthorsSlider.innerHTML = '';
                mostReadAuthorsIndicatorsContainer.innerHTML = '';

                authors.forEach((author, index) => {
                    const slide = document.createElement('div');
                    slide.className = 'most-read-slide';
                    const authorCard = document.createElement('div');
                    authorCard.className = 'book-card'; // Reusing book-card class for styling consistency
                    authorCard.innerHTML = `
                        <img src="${author.img ? 'data:image/jpeg;base64,' + author.img : '/static/images/default_author.jpg'}" alt="${author.first_name} ${author.last_name}">
                        <h3>${author.first_name} ${author.last_name}</h3>
                        <p>Read Count: ${author.read_count || 0}</p>
                    `;
                    slide.appendChild(authorCard);
                    mostReadAuthorsSlider.appendChild(slide);
                });

                totalAuthorSlides = authors.length;
                const maxIndicators = Math.max(0, totalAuthorSlides - authorsPerView + 1);
                for (let i = 0; i < maxIndicators; i++) {
                    const indicator = document.createElement('div');
                    indicator.className = 'most-read-indicator';
                    indicator.setAttribute('data-target', i);
                    mostReadAuthorsIndicatorsContainer.appendChild(indicator);
                }

                updateMostReadAuthorsSlider();

                const mostReadAuthorsIndicators = document.querySelectorAll('.most-read-authors-indicators .most-read-indicator');
                mostReadAuthorsIndicators.forEach(indicator => {
                    indicator.addEventListener('click', () => {
                        showMostReadAuthorsSlide(parseInt(indicator.getAttribute('data-target')));
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching most read authors:', error);
                showNotification('Failed to load most read authors.', 'error');
            });
    }

    function showMostReadAuthorsSlide(index) {
        const maxIndex = Math.max(0, totalAuthorSlides - authorsPerView);
        mostReadAuthorsCurrentIndex = index;
        if (index > maxIndex) {
            mostReadAuthorsCurrentIndex = 0;
        } else if (index < 0) {
            mostReadAuthorsCurrentIndex = maxIndex;
        }
        const translateX = mostReadAuthorsCurrentIndex * -25; // Shift by 25% (one author)
        mostReadAuthorsSlider.style.transform = `translateX(${translateX}%)`;
        updateMostReadAuthorsIndicators();
    }

    function updateMostReadAuthorsIndicators() {
        const mostReadAuthorsIndicators = document.querySelectorAll('.most-read-authors-indicators .most-read-indicator');
        mostReadAuthorsIndicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === mostReadAuthorsCurrentIndex);
        });
    }

    mostReadAuthorsPrevBtn.addEventListener('click', () => {
        showMostReadAuthorsSlide(mostReadAuthorsCurrentIndex - 1);
    });

    mostReadAuthorsNextBtn.addEventListener('click', () => {
        showMostReadAuthorsSlide(mostReadAuthorsCurrentIndex + 1);
    });

    setInterval(() => {
        showMostReadAuthorsSlide(mostReadAuthorsCurrentIndex + 1);
    }, 10000);

    function updateMostReadAuthorsSlider() {
        updateMostReadAuthorsIndicators();
    }

    fetchMostReadAuthors();

    function showNotification(message, type = 'error') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerText = message;
        document.body.appendChild(notification);

        notification.style.opacity = '1';

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 2500);
    }

    document.querySelectorAll('.login-form form').forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(this);
            fetch(this.action, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showNotification(data.error, 'error');
                } else {
                    showNotification('Login successful!', 'success');
                    setTimeout(() => {
                        window.location.href = data.redirect;
                    }, 2000);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred. Please try again.', 'error');
            });
        });
    });
});