document.addEventListener('DOMContentLoaded', function() {
    const libraryText = document.getElementById('library-text');
    const userLoginForm = document.getElementById('user-login-form');

    if (libraryText) {
        libraryText.addEventListener('click', function(event) {
            event.preventDefault();
            if (userLoginForm && librarianLoginForm) {
                userLoginForm.style.display = 'none';
            }

            // Determine the current page and navigate accordingly
            const currentPage = window.location.pathname.split('/').pop();
            window.location.href = '/';
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.querySelector('.modal');
    const closeButton = document.querySelector('.close-button');

    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
});

function openFrame(frameId) {
    document.getElementById(frameId).style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    document.body.classList.add('no-scroll');
}

function closeFrame(frameId) {
    document.getElementById(frameId).style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.body.classList.remove('no-scroll');

    // Reset form inputs
    if (frameId === 'librarianFormContainer') {
        resetFormInputs('librarianForm');
    } else if (frameId === 'userFormContainer') {
        resetFormInputs('userForm');
    } else if (frameId === 'bookFormContainer') {
        resetFormInputs('bookForm');
    } else if (frameId === 'authorFormContainer') {
        resetFormInputs('authorForm');
    }
}

function resetFormInputs(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

function openLibrarianForm() {
    openFrame('librarianFormContainer');
}

function closeLibrarianForm() {
    closeFrame('librarianFormContainer');
}

function openUserForm() {
    openFrame('userFormContainer');
}

function closeUserForm() {
    closeFrame('userFormContainer');
}

function openBookForm() {
    openFrame('bookFormContainer');
}

function closeBookForm() {
    closeFrame('bookFormContainer');
}

function openAuthorForm() {
    openFrame('authorFormContainer');
}

function closeAuthorForm() {
    closeFrame('authorFormContainer');
}

async function openUserList() {
    openFrame('userListFrame');
    try {
        const response = await fetch('/get_user_list');
        const data = await response.json();
        const tableBody = document.querySelector('#userTable tbody');
        tableBody.innerHTML = '';
        data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.userID}</td>
                <td>${user.userFirstName} ${user.userLastName}</td>
                <td>${user.librarianFirstName} ${user.librarianLastName}</td>
                <td>${user.librarianID}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching user list:', error);
    }
}

function closeUserList() {
    closeFrame('userListFrame');
}

async function openBookList() {
    openFrame('bookListFrame');
    try {
        const response = await fetch('/get_book_list');
        const data = await response.json();
        const tableBody = document.querySelector('#bookTable tbody');
        tableBody.innerHTML = '';

        data.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.ISBN}</td>
                <td>${book.book_name}</td>
                <td>${book.genre}</td>
                <td>${book.publicationyear}</td>
                <td>${book.authors}</td>
                <td>${book.librarians}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching book list:', error);
    }
}

function closeBookList() {
    closeFrame('bookListFrame');
}

async function openAuthorList() {
    openFrame('authorListFrame');
    try {
        const response = await fetch('/get_author_list');
        const data = await response.json();
        const tableBody = document.querySelector('#authorTable tbody');
        tableBody.innerHTML = '';
        data.forEach(author => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${author.authorID}</td>
                <td>${author.first_name} ${author.last_name}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching author list:', error);
    }
}

function closeAuthorList() {
    closeFrame('authorListFrame');
}

async function openBorrowList() {
    openFrame('borrowListFrame');
    try {
        const response = await fetch('/get_borrow_list');
        const data = await response.json();
        const tableBody = document.querySelector('#borrowTable tbody');
        tableBody.innerHTML = '';
        data.forEach(borrow => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${borrow.loanID}</td>
                <td>${borrow.userID}</td>
                <td>${borrow.first_name} ${borrow.last_name}</td>
                <td>${borrow.book_name}</td>
                <td>${borrow.ISBN}</td>
                <td>${borrow.loan_date}</td>
                <td>${borrow.return_date || ' '}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching borrow list:', error);
    }
}

function closeBorrowList() {
    closeFrame('borrowListFrame');
}

async function submitLibrarianForm() {
    const form = document.getElementById('librarianForm');
    const formData = new FormData(form);

    try {
        const response = await fetch('/add_librarian', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            alert('Librarian added successfully');
            closeLibrarianForm();
            location.reload();
        } else {
            alert('Error adding librarian: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the librarian');
    }
}

async function submitAuthorForm() {
    const form = document.getElementById('authorForm');
    const formData = new FormData(form);

    try {
        const response = await fetch('/add_author', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            closeAuthorForm();
            location.reload();
        } else {
            alert('Error adding author');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function submitUserForm() {
    const form = document.getElementById('userForm');
    const formData = new FormData(form);

    try {
        const response = await fetch('/add_user_route', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            alert('User added successfully');
            closeUserForm();
            location.reload();
        } else {
            alert('Error adding user: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the user');
    }
}

async function submitBookForm() {
    const form = document.getElementById('bookForm');
    const formData = new FormData(form);

    try {
        const response = await fetch('/add_book', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            alert('Book added successfully');
            closeBookForm();
            location.reload();
        } else {
            alert('Error adding book: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the book');
    }
}

function addAuthorField() {
    const authorsContainer = document.getElementById('authorsContainer');
    const newAuthorField = document.createElement('div');
    newAuthorField.className = 'author-fields';
    newAuthorField.innerHTML = `
        <label for="authorFirstName">Author First Name:</label>
        <input type="text" name="authorFirstName[]" required>
        <label for="authorLastName">Author Last Name:</label>
        <input type="text" name="authorLastName[]" required>
    `;
    authorsContainer.appendChild(newAuthorField);
}
