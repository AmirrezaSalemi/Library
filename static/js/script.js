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

            // Determine the current page and navigate accordingly
            const currentPage = window.location.pathname.split('/').pop();
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

    // Slider functionality
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

    // Optional: Auto-slide every 8 seconds
    setInterval(() => {
        showSlide(currentIndex + 1);
    }, 8000);

    // Initialize the indicators
    updateIndicators();

    function showNotification(message, type = 'error') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerText = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
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
                    showNotification(data.error, 'error'); // Pass 'error' as the second argument
                } else {
                    showNotification('Login successful!', 'success'); // Pass 'success' as the second argument
                    window.location.href = data.redirect;
                }
            })
            .catch(error => console.error('Error:', error));
        });
    });
});
