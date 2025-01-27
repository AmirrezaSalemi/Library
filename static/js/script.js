document.addEventListener('DOMContentLoaded', function() {
    const userLink = document.getElementById('user-link');
    const librarianLink = document.getElementById('librarian-link');
    const libraryText = document.getElementById('library-text');
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
        });

        librarianLink.addEventListener('click', function(event) {
            event.preventDefault();
            librarianLoginForm.style.display = 'block';
            userLoginForm.style.display = 'none';
            resetForm(librarianLoginForm);
        });
    }

    if (libraryText) {
        libraryText.addEventListener('click', function(event) {
            event.preventDefault();
            if (userLoginForm && librarianLoginForm) {
                userLoginForm.style.display = 'none';
                librarianLoginForm.style.display = 'none';
                resetForm(userLoginForm);
                resetForm(librarianLoginForm);
            }

            // Determine the current page and navigate accordingly
            const currentPage = window.location.pathname.split('/').pop();
                window.location.href = '/';
        });
    }
});

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

document.getElementById('librarian-link').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('librarian-login-form').style.display = 'block';
    toggleBlur(true);
});

document.getElementById('user-link').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('user-login-form').style.display = 'block';
    toggleBlur(true);
});

document.getElementById('close-librarian-login').addEventListener('click', function() {
    document.getElementById('librarian-login-form').style.display = 'none';
    toggleBlur(false);
});

document.getElementById('close-user-login').addEventListener('click', function() {
    document.getElementById('user-login-form').style.display = 'none';
    toggleBlur(false);
});
