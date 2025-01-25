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
document.addEventListener('DOMContentLoaded', function() {
    const authorsLink = document.querySelector('a[href="/user_home/page1"]');
    const modal = document.querySelector('.modal');
    const closeButton = document.querySelector('.close-button');
    const authorsTableBody = document.getElementById('authors-table-body');

    authorsLink.addEventListener('click', function(event) {
        event.preventDefault();
        modal.style.display = 'block';

        fetch('/get_author_list')
            .then(response => response.json())
            .then(data => {
                authorsTableBody.innerHTML = '';
                data.forEach(author => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${author.authorID}</td>
                        <td>${author.first_name}</td>
                        <td>${author.last_name}</td>
                    `;
                    authorsTableBody.appendChild(row);
                });
            })
            .catch(error => console.error('Error fetching authors:', error));
    });

    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
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

document.querySelectorAll('.rectangle').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const frameId = this.id.replace('-link', '-frame');
        document.getElementById(frameId).style.display = 'block';
        toggleBlur(true);
    });
});

document.querySelectorAll('.close-btn').forEach(button => {
    button.addEventListener('click', function() {
        const frameId = this.getAttribute('data-frame');
        document.getElementById(frameId).style.display = 'none';
        toggleBlur(false);
    });
});

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

document.getElementById('query1-link').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/get_librarians')
    .then(response => response.json())
    .then(data => {
        const tableBody = document.querySelector('#librarian-table tbody');
        tableBody.innerHTML = ''; // Clear existing rows
        data.forEach(librarian => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${librarian.librarianID}</td>
                <td>${librarian.first_name}</td>
                <td>${librarian.last_name}</td>
            `;
            tableBody.appendChild(row);
        });
        document.getElementById('query1-frame').style.display = 'block';
        toggleBlur(true);
    });
});

document.getElementById('query2-link').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/get_authors')
    .then(response => response.json())
    .then(data => {
        const tableBody = document.querySelector('#author-table tbody');
        tableBody.innerHTML = ''; // Clear existing rows
        data.forEach(author => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${author.authorID}</td>
                <td>${author.first_name}</td>
                <td>${author.last_name}</td>
            `;
            tableBody.appendChild(row);
        });
        document.getElementById('query2-frame').style.display = 'block';
        toggleBlur(true);
    });
});

document.getElementById('query3-link').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/get_users')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#user-table tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            data.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.userID}</td>
                    <td>${user.first_name}</td>
                    <td>${user.last_name}</td>
                    <td>${user.city}</td>
                    <td>${user.Street}</td>
                    <td>${user.age}</td>
                    <td>${user.librarianID}</td>
                `;
                tableBody.appendChild(row);
            });
            document.getElementById('query3-frame').style.display = 'block';
            toggleBlur(true);
        });
});

document.getElementById('query4-link').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/get_names')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#name-table tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            data.forEach(name => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${name.first_name}</td>
                    <td>${name.last_name}</td>
                `;
                tableBody.appendChild(row);
            });
            document.getElementById('query4-frame').style.display = 'block';
            toggleBlur(true);
        });
});
document.getElementById('query5-link').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/get_authors_query5')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#author-table-query5 tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            data.forEach(author => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${author.authorID}</td>
                    <td>${author.first_name}</td>
                    <td>${author.last_name}</td>
                `;
                tableBody.appendChild(row);
            });
            document.getElementById('query5-frame').style.display = 'block';
            toggleBlur(true);
        });
});
document.getElementById('query6-link').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/run_query6')
        .then(response => response.json())
        .then(data => {
            const resultElement = document.getElementById('query6-result');
            if (data.message) {
                resultElement.textContent = data.message;
            } else if (data.error) {
                resultElement.textContent = 'Error: ' + data.error;
            }
            document.getElementById('query6-frame').style.display = 'block';
            toggleBlur(true);
        });
});
document.getElementById('query7-link').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/run_query7')
        .then(response => response.json())
        .then(data => {
            const resultElement = document.getElementById('query7-result');
            if (data.message) {
                resultElement.textContent = data.message;
            } else if (data.error) {
                resultElement.textContent = 'Error: ' + data.error;
            }
            document.getElementById('query7-frame').style.display = 'block';
            toggleBlur(true);
        });
});
document.getElementById('query8-link').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/get_avg_age_query8')
        .then(response => response.json())
        .then(data => {
            const resultElement = document.getElementById('query8-result');
            if (data.average_age) {
                resultElement.textContent = 'Average Age: ' + data.average_age;
            } else {
                resultElement.textContent = 'No data available';
            }
            document.getElementById('query8-frame').style.display = 'block';
            toggleBlur(true);
        });
});
document.getElementById('query9-link').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/get_librarians_query9')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#librarian-table-query9 tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            data.forEach(librarian => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${librarian.librarianID}</td>
                    <td>${librarian.first_name}</td>
                    <td>${librarian.last_name}</td>
                `;
                tableBody.appendChild(row);
            });
            document.getElementById('query9-frame').style.display = 'block';
            toggleBlur(true);
        });
});
document.getElementById('query10-link').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/get_isbns_query10')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#isbn-table-query10 tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            data.forEach(isbn => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${isbn.ISBN}</td>
                `;
                tableBody.appendChild(row);
            });
            document.getElementById('query10-frame').style.display = 'block';
            toggleBlur(true);
        });
});
document.getElementById('query11-link').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/get_users_query11')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#user-table-query11 tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            data.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.userID}</td>
                    <td>${user.first_name}</td>
                    <td>${user.last_name}</td>
                    <td>${user.city}</td>
                    <td>${user.Street}</td>
                    <td>${user.age}</td>
                    <td>${user.librarianID}</td>
                `;
                tableBody.appendChild(row);
            });
            document.getElementById('query11-frame').style.display = 'block';
            toggleBlur(true);
        });
});
document.getElementById('query12-link').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/get_users_query12')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#user-table-query12 tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            data.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.userID}</td>
                    <td>${user.first_name}</td>
                    <td>${user.last_name}</td>
                    <td>${user.city}</td>
                    <td>${user.Street}</td>
                    <td>${user.age}</td>
                    <td>${user.librarianID}</td>
                `;
                tableBody.appendChild(row);
            });
            document.getElementById('query12-frame').style.display = 'block';
            toggleBlur(true);
        });
});
document.getElementById('query13-link').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/get_librarians_query13')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#librarian-table-query13 tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            data.forEach(librarian => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${librarian.librarianID}</td>
                    <td>${librarian.first_name}</td>
                    <td>${librarian.last_name}</td>
                `;
                tableBody.appendChild(row);
            });
            document.getElementById('query13-frame').style.display = 'block';
            toggleBlur(true);
        });
});
document.getElementById('query14-link').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/get_first_names_query14')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#first-name-table-query14 tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            data.forEach(name => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${name.first_name}</td>
                `;
                tableBody.appendChild(row);
            });
            document.getElementById('query14-frame').style.display = 'block';
            toggleBlur(true);
        });
});
document.getElementById('query15-link').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/get_authors_query15')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#author-table-query15 tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            data.forEach(author => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${author.authorID}</td>
                    <td>${author.first_name}</td>
                    <td>${author.last_name}</td>
                `;
                tableBody.appendChild(row);
            });
            document.getElementById('query15-frame').style.display = 'block';
            toggleBlur(true);
        });
});
document.getElementById('custom-query-link').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('custom-query-frame').style.display = 'block';
    toggleBlur(true);
});
document.getElementById('run-custom-query-button').addEventListener('click', function(event) {
    event.preventDefault();
    const query = document.getElementById('custom-query-input').value;
    fetch('/run_custom_query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query })
    })
    .then(response => response.json())
    .then(data => {
        const resultElement = document.getElementById('custom-query-result');
        if (data.error) {
            resultElement.textContent = 'Error: ' + data.error;
        } else {
            resultElement.textContent = JSON.stringify(data.result, null, 2);
        }
    });
});