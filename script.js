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

    libraryText.addEventListener('click', function(event) {
        event.preventDefault();
        userLoginForm.style.display = 'none';
        librarianLoginForm.style.display = 'none';
        resetForm(userLoginForm);
        resetForm(librarianLoginForm);
    });

    userLoginForm.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        fetch('/login/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.message === 'User login successful') {
                window.location.href = data.redirect;
            }
        })
        .catch(error => console.error('Error:', error));
    });

    librarianLoginForm.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        fetch('/login/librarian', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.message === 'Librarian login successful') {
                window.location.href = data.redirect;
            }
        })
        .catch(error => console.error('Error:', error));
    });
});
