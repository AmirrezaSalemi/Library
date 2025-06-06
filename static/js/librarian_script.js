document.addEventListener('DOMContentLoaded', function() {
    const libraryText = document.getElementById('library-logo');
    const userLoginForm = document.getElementById('user-login-form');

    if (libraryText) {
        libraryText.addEventListener('click', function(event) {
            event.preventDefault();
            if (userLoginForm) {
                userLoginForm.style.display = 'none';
            }
            window.location.href = '/';
        });
    }

    const authorSelect = document.getElementById('authorSelect');
    if (authorSelect) {
        fetchAuthorsForDropdown(authorSelect);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.querySelector('.modal');
    const closeButton = document.querySelector('.close-button');

    if (closeButton && modal) {
        closeButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });

        window.addEventListener('click', function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    }
});

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationIcon = document.getElementById('notification-icon');

    notificationMessage.textContent = message;
    notification.className = `notification ${type} show`;
    notificationIcon.textContent = type === 'success' ? '✔' : '❌';
    notification.style.display = 'flex';

    setTimeout(() => {
        notification.className = `notification ${type}`;
        notification.style.display = 'none';
    }, 3000);
}

let openFrameCount = 0;

function openFrame(frameId) {
    const frame = document.getElementById(frameId);
    if (frame.style.display === 'none' || frame.style.display === '') {
        frame.style.display = 'block';
        openFrameCount++;
        document.getElementById('overlay').style.display = 'block';
        document.querySelector('.content-wrapper').classList.add('blur');
        document.querySelector('.content-wrapper').classList.add('no-scroll');
        if (document.querySelector('.frame')) {
            document.querySelector('.frame').classList.remove('blur');
            document.querySelector('.frame-content').classList.remove('no-scroll');
        }
    }
}

function closeFrame(frameId) {
    const frame = document.getElementById(frameId);
    if (frame.style.display === 'block') {
        frame.style.display = 'none';
        openFrameCount--;
        if (openFrameCount === 0) {
            document.getElementById('overlay').style.display = 'none';
            document.querySelector('.content-wrapper').classList.remove('blur');
            document.querySelector('.content-wrapper').classList.remove('no-scroll');
        }
    }
    resetFormInputs(frameId);
}

function resetFormInputs(frameId) {
    const frame = document.getElementById(frameId);
    if (frame) {
        const inputs = frame.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'text' || input.type === 'number' || input.type === 'email' || input.type === 'password' || input.type === 'file') {
                input.value = '';
            } else if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            } else if (input.tagName === 'TEXTAREA') {
                input.value = '';
            }
        });
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
    const authorsContainer = document.getElementById('authorsContainer');
    authorsContainer.innerHTML = '';
    addAuthorField();
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
            row.setAttribute('data-id', user.userID);
            row.innerHTML = `
                <td>${user.userID}</td>
                <td>${user.userFirstName} ${user.userLastName}</td>
                <td>${user.librarianFirstName} ${user.librarianLastName}</td>
                <td>${user.librarianID}</td>
                <td>
                    <img src="static/images/Edit.png" alt="Edit" class="action-icon" title="Edit User" onclick="editUser(${user.userID})">
                    <img src="static/images/Trash.png" alt="Delete" class="action-icon" title="Delete User" onclick="openDeleteConfirmation('user', ${user.userID})">
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching user list:', error);
        showNotification('Error fetching user list', 'error');
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
        const bookListContainer = document.querySelector('#bookListContainer');
        bookListContainer.innerHTML = '';

        data.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.className = 'book-item';
            bookItem.setAttribute('data-id', book.ISBN);
            bookItem.innerHTML = `
                <div class="book-image">
                    <img src="${book.img ? 'data:image/jpeg;base64,' + book.img : 'static/images/default_book.png'}" alt="Book Image">
                </div>
                <div class="book-details">
                    <h3>${book.book_name}</h3>
                    <p><strong>ISBN:</strong> ${book.ISBN}</p>
                    <p><strong>Genre:</strong> ${book.genre}</p>
                    <p><strong>Publication Year:</strong> ${book.publicationyear}</p>
                    <p><strong>Authors:</strong> ${book.authors}</p>
                </div>
                <div class="book-librarian">
                    <p><strong>Added by Librarian:</strong> ${book.librarians}</p>
                </div>
                <div class="book-actions">
                    <img src="static/images/Edit.png" alt="Edit" class="action-icon" title="Edit Book" onclick="editBook('${book.ISBN}')">
                    <img src="static/images/Trash.png" alt="Delete" class="action-icon" title="Delete Book" onclick="openDeleteConfirmation('book', '${book.ISBN}')">
                </div>
            `;
            bookListContainer.appendChild(bookItem);
        });
    } catch (error) {
        console.error('Error fetching book list:', error);
        showNotification('Error fetching book list', 'error');
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
            row.setAttribute('data-id', author.authorID);
            row.innerHTML = `
                <td>${author.authorID}</td>
                <td>${author.first_name} ${author.last_name}</td>
                <td><img src="${author.img ? 'data:image/jpeg;base64,' + author.img : 'static/images/default_author.png'}" alt="Author Image" style="width:50px;height:auto;"></td>
                <td>
                    <img src="static/images/Edit.png" alt="Edit" class="action-icon" title="Edit Author" onclick="editAuthor(${author.authorID})">
                    <img src="static/images/Trash.png" alt="Delete" class="action-icon" title="Delete Author" onclick="openDeleteConfirmation('author', ${author.authorID})">
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching author list:', error);
        showNotification('Error fetching author list', 'error');
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
            row.setAttribute('data-id', borrow.loanID);
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
        showNotification('Error fetching borrow list', 'error');
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
            showNotification('Librarian added successfully', 'success');
            closeLibrarianForm();
            if (document.getElementById('userListFrame').style.display === 'block') {
                openUserList();
            }
        } else {
            showNotification('Error adding librarian: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while adding the librarian', 'error');
    }
}

async function submitAuthorForm() {
    const form = document.getElementById('authorForm');
    const authorImage = document.getElementById('authorImage').files[0];
    if (authorImage && authorImage.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        return;
    }

    const formData = new FormData(form);
    const authorID = formData.get('authorID');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');

    try {
        const response = await fetch('/add_author', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Author added successfully', 'success');
            closeAuthorForm();
            if (document.getElementById('authorListFrame').style.display === 'block') {
                const tableBody = document.querySelector('#authorTable tbody');
                const row = document.createElement('tr');
                row.setAttribute('data-id', authorID);
                row.innerHTML = `
                    <td>${authorID}</td>
                    <td>${firstName} ${lastName}</td>
                    <td><img src="${data.img ? 'data:image/jpeg;base64,' + data.img : 'static/images/default_author.png'}" alt="Author Image" style="width:50px;height:auto;"></td>
                    <td>
                        <img src="static/images/Edit.png" alt="Edit" class="action-icon" title="Edit Author" onclick="editAuthor(${authorID})">
                        <img src="static/images/Trash.png" alt="Delete" class="action-icon" title="Delete Author" onclick="openDeleteConfirmation('author', ${authorID})">
                    </td>
                `;
                tableBody.appendChild(row);
            }
            updateAuthorDropdowns({ authorID, full_name: `${firstName} ${lastName}` });
        } else {
            showNotification('Error adding author: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while adding the author', 'error');
    }
}

async function submitUserForm() {
    const form = document.getElementById('userForm');
    const formData = new FormData(form);
    const userID = formData.get('userID');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');

    try {
        const sessionResponse = await fetch('/get_session_librarian');
        const sessionData = await sessionResponse.json();
        const librarianID = sessionData.librarianID;

        if (!librarianID) {
            showNotification('Librarian ID not found in session', 'error');
            return;
        }

        formData.append('librarianID', librarianID);

        const response = await fetch('/add_user_route', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            showNotification('User added successfully', 'success');
            closeUserForm();
            if (document.getElementById('userListFrame').style.display === 'block') {
                const tableBody = document.querySelector('#userTable tbody');
                const row = document.createElement('tr');
                row.setAttribute('data-id', userID);
                row.innerHTML = `
                    <td>${userID}</td>
                    <td>${firstName} ${lastName}</td>
                    <td>${data.librarianFirstName || ''} ${data.librarianLastName || ''}</td>
                    <td>${librarianID}</td>
                    <td>
                        <img src="static/images/Edit.png" alt="Edit" class="action-icon" title="Edit User" onclick="editUser(${userID})">
                        <img src="static/images/Trash.png" alt="Delete" class="action-icon" title="Delete User" onclick="openDeleteConfirmation('user', ${userID})">
                    </td>
                `;
                tableBody.appendChild(row);
            }
        } else {
            showNotification('Error adding user: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while adding the user', 'error');
    }
}

async function submitBookForm() {
    const form = document.getElementById('bookForm');
    const bookImage = document.getElementById('bookImage').files[0];
    if (bookImage && bookImage.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        return;
    }

    const formData = new FormData(form);
    const ISBN = formData.get('ISBN');
    const bookName = formData.get('bookName');
    const genre = formData.get('genre');
    const publicationYear = formData.get('publicationYear');
    const authorIDs = formData.getAll('authorID[]');

    try {
        const sessionResponse = await fetch('/get_session_librarian');
        const sessionData = await sessionResponse.json();
        const librarianID = sessionData.librarianID;

        if (!librarianID) {
            showNotification('Librarian ID not found in session', 'error');
            return;
        }

        formData.append('librarianID', librarianID);

        const response = await fetch('/add_book', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Book added successfully', 'success');
            closeBookForm();
            if (document.getElementById('bookListFrame').style.display === 'block') {
                const bookListContainer = document.querySelector('#bookListContainer');
                const bookItem = document.createElement('div');
                bookItem.className = 'book-item';
                bookItem.setAttribute('data-id', ISBN);
                bookItem.innerHTML = `
                    <div class="book-image">
                        <img src="${data.img ? 'data:image/jpeg;base64,' + data.img : 'static/images/default_book.png'}" alt="Book Image">
                    </div>
                    <div class="book-details">
                        <h3>${bookName}</h3>
                        <p><strong>ISBN:</strong> ${ISBN}</p>
                        <p><strong>Genre:</strong> ${genre}</p>
                        <p><strong>Publication Year:</strong> ${publicationYear}</p>
                        <p><strong>Authors:</strong> ${data.authors || authorIDs.join(', ')}</p>
                    </div>
                    <div class="book-librarian">
                        <p><strong>Added by Librarian:</strong> ${data.librarians || librarianID}</p>
                    </div>
                    <div class="book-actions">
                        <img src="static/images/Edit.png" alt="Edit" class="action-icon" title="Edit Book" onclick="editBook('${ISBN}')">
                        <img src="static/images/Trash.png" alt="Delete" class="action-icon" title="Delete Book" onclick="openDeleteConfirmation('book', '${ISBN}')">
                    </div>
                `;
                bookListContainer.appendChild(bookItem);
            }
        } else {
            showNotification('Error adding book: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while adding the book', 'error');
    }
}

function addAuthorField() {
    const authorsContainer = document.getElementById('authorsContainer');
    const newAuthorField = document.createElement('div');
    newAuthorField.className = 'author-fields';
    newAuthorField.innerHTML = `
        <label for="authorSelect">Author:</label>
        <select name="authorID[]" required>
        </select>
    `;
    const authorSelect = newAuthorField.querySelector('select');
    fetchAuthorsForDropdown(authorSelect);
    authorsContainer.appendChild(newAuthorField);
}

function addEditAuthorField() {
    const authorsContainer = document.getElementById('editAuthorsContainer');
    const newAuthorField = document.createElement('div');
    newAuthorField.className = 'author-fields';
    newAuthorField.innerHTML = `
        <label for="editAuthorSelect">Author:</label>
        <select name="authorID[]" required>
        </select>
    `;
    const authorSelect = newAuthorField.querySelector('select');
    fetchAuthorsForDropdown(authorSelect);
    authorsContainer.appendChild(newAuthorField);
}

async function fetchAuthorsForDropdown(selectElement) {
    try {
        const response = await fetch('/get_authors_for_dropdown');
        const data = await response.json();
        selectElement.innerHTML = '';
        data.forEach(author => {
            const option = document.createElement('option');
            option.value = author.authorID;
            option.textContent = author.full_name;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching authors:', error);
        showNotification('Error fetching authors', 'error');
    }
}

function updateAuthorDropdowns(newAuthor) {
    const selects = document.querySelectorAll('select[name="authorID[]"]');
    selects.forEach(select => {
        const option = document.createElement('option');
        option.value = newAuthor.authorID;
        option.textContent = newAuthor.full_name;
        select.appendChild(option);
    });
}

function openDeleteConfirmation(type, id) {
    openFrame('deleteConfirmationFrame');
    window.currentDeleteType = type;
    window.currentDeleteId = id;
}

function closeDeleteConfirmation() {
    closeFrame('deleteConfirmationFrame');
}

function denyDelete() {
    closeDeleteConfirmation();
}

async function confirmDelete() {
    const type = window.currentDeleteType;
    const id = window.currentDeleteId;

    try {
        let response;
        if (type === 'user') {
            response = await fetch(`/delete_user/${id}`, { method: 'DELETE' });
        } else if (type === 'book') {
            response = await fetch(`/delete_book/${id}`, { method: 'DELETE' });
        } else if (type === 'author') {
            response = await fetch(`/delete_author/${id}`, { method: 'DELETE' });
        }

        const data = await response.json();
        if (data.success) {
            showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`, 'success');
            closeDeleteConfirmation();
            if (type === 'book') {
                const bookListContainer = document.querySelector('#bookListContainer');
                const bookItem = bookListContainer.querySelector(`.book-item[data-id="${id}"]`);
                if (bookItem) {
                    bookItem.remove();
                }
            } else {
                const tableId = type === 'user' ? 'userTable' : 'authorTable';
                const tableBody = document.querySelector(`#${tableId} tbody`);
                const row = tableBody.querySelector(`tr[data-id="${id}"]`);
                if (row) {
                    row.remove();
                }
            }
        } else {
            showNotification('Error deleting item: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while deleting the item', 'error');
    }
}

async function editUser(userID) {
    try {
        const response = await fetch(`/get_user/${userID}`);
        const data = await response.json();
        if (data.success) {
            const user = data.user;
            document.getElementById('editUserID').value = user.userID;
            document.getElementById('editFirstName').value = user.first_name;
            document.getElementById('editLastName').value = user.last_name;
            document.getElementById('editCity').value = user.city;
            document.getElementById('editStreet').value = user.street;
            document.getElementById('editAge').value = user.age;
            openFrame('editUserFormContainer');
        } else {
            showNotification('Error fetching user data: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while fetching the user data', 'error');
    }
}

async function editBook(ISBN) {
    try {
        const response = await fetch(`/get_book/${ISBN}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            const book = data.book;
            document.getElementById('editISBN').value = book.ISBN;
            document.getElementById('editBookName').value = book.book_name;
            document.getElementById('editGenre').value = book.genre;
            document.getElementById('editPublicationYear').value = book.publicationyear;

            const authorsContainer = document.getElementById('editAuthorsContainer');
            authorsContainer.innerHTML = '';

            if (Array.isArray(book.authors)) {
                book.authors.forEach(author => {
                    const authorField = document.createElement('div');
                    authorField.className = 'author-fields';
                    authorField.innerHTML = `
                        <label for="editAuthorSelect">Author:</label>
                        <select name="authorID[]" required></select>
                    `;
                    const authorSelect = authorField.querySelector('select');
                    fetchAuthorsForDropdown(authorSelect).then(() => {
                        authorSelect.value = author.authorID;
                    });
                    authorsContainer.appendChild(authorField);
                });
            }

            openFrame('editBookFormContainer');
        } else {
            showNotification('Error fetching book data: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while fetching the book data', 'error');
    }
}

async function editAuthor(authorID) {
    try {
        const response = await fetch(`/get_author/${authorID}`);
        const data = await response.json();
        if (data.success) {
            const author = data.author;
            document.getElementById('editAuthorID').value = author.authorID;
            document.getElementById('editFirstNameAuthor').value = author.first_name;
            document.getElementById('editLastNameAuthor').value = author.last_name;
            openFrame('editAuthorFormContainer');
        } else {
            showNotification('Error fetching author data: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while fetching the author data', 'error');
    }
}

async function submitEditUserForm() {
    const form = document.getElementById('editUserForm');
    const formData = new FormData(form);
    const userID = formData.get('userID');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');

    try {
        const sessionResponse = await fetch('/get_session_librarian');
        const sessionData = await sessionResponse.json();
        const librarianID = sessionData.librarianID;

        if (!librarianID) {
            showNotification('Librarian ID not found in session', 'error');
            return;
        }

        formData.append('librarianID', librarianID);

        const response = await fetch('/edit_user', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            showNotification('User updated successfully', 'success');
            closeEditUserForm();
            if (document.getElementById('userListFrame').style.display === 'block') {
                const tableBody = document.querySelector('#userTable tbody');
                const row = tableBody.querySelector(`tr[data-id="${userID}"]`);
                if (row) {
                    row.innerHTML = `
                        <td>${userID}</td>
                        <td>${firstName} ${lastName}</td>
                        <td>${data.librarianFirstName || ''} ${data.librarianLastName || ''}</td>
                        <td>${librarianID}</td>
                        <td>
                            <img src="static/images/Edit.png" alt="Edit" class="action-icon" title="Edit User" onclick="editUser(${userID})">
                            <img src="static/images/Trash.png" alt="Delete" class="action-icon" title="Delete User" onclick="openDeleteConfirmation('user', ${userID})">
                        </td>
                    `;
                }
            }
        } else {
            showNotification('Error updating user: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while updating the user', 'error');
    }
}

async function submitEditBookForm() {
    const form = document.getElementById('editBookForm');
    const bookImage = document.getElementById('editBookImage').files[0];
    if (bookImage && bookImage.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        return;
    }

    const formData = new FormData(form);
    const ISBN = formData.get('ISBN');
    const bookName = formData.get('bookName');
    const genre = formData.get('genre');
    const publicationYear = formData.get('publicationYear');
    const authorIDs = formData.getAll('authorID[]');

    try {
        const sessionResponse = await fetch('/get_session_librarian');
        const sessionData = await sessionResponse.json();
        const librarianID = sessionData.librarianID;

        if (!librarianID) {
            showNotification('Librarian ID not found in session', 'error');
            return;
        }

        formData.append('librarianID', librarianID);

        const response = await fetch('/edit_book', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Book updated successfully', 'success');
            closeEditBookForm();
            if (document.getElementById('bookListFrame').style.display === 'block') {
                const bookListContainer = document.querySelector('#bookListContainer');
                const bookItem = bookListContainer.querySelector(`.book-item[data-id="${ISBN}"]`);
                if (bookItem) {
                    bookItem.innerHTML = `
                        <div class="book-image">
                            <img src="${data.img ? 'data:image/jpeg;base64,' + data.img : 'static/images/default_book.png'}" alt="Book Image">
                        </div>
                        <div class="book-details">
                            <h3>${bookName}</h3>
                            <p><strong>ISBN:</strong> ${ISBN}</p>
                            <p><strong>Genre:</strong> ${genre}</p>
                            <p><strong>Publication Year:</strong> ${publicationYear}</p>
                            <p><strong>Authors:</strong> ${data.authors || authorIDs.join(', ')}</p>
                        </div>
                        <div class="book-librarian">
                            <p><strong>Added by Librarian:</strong> ${data.librarians || librarianID}</p>
                        </div>
                        <div class="book-actions">
                            <img src="static/images/Edit.png" alt="Edit" class="action-icon" title="Edit Book" onclick="editBook('${ISBN}')">
                            <img src="static/images/Trash.png" alt="Delete" class="action-icon" title="Delete Book" onclick="openDeleteConfirmation('book', '${ISBN}')">
                        </div>
                    `;
                }
            }
        } else {
            showNotification('Error updating book: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while updating the book', 'error');
    }
}

async function submitEditAuthorForm() {
    const form = document.getElementById('editAuthorForm');
    const authorImage = document.getElementById('editAuthorImage').files[0];
    if (authorImage && authorImage.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        return;
    }

    const formData = new FormData(form);
    const authorID = formData.get('authorID');
    const firstName = formData.get('first_name');
    const lastName = formData.get('last_name');

    try {
        const response = await fetch('/edit_author', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Author updated successfully', 'success');
            closeEditAuthorForm();
            if (document.getElementById('authorListFrame').style.display === 'block') {
                const tableBody = document.querySelector('#authorTable tbody');
                const row = tableBody.querySelector(`tr[data-id="${authorID}"]`);
                if (row) {
                    row.innerHTML = `
                        <td>${authorID}</td>
                        <td>${firstName} ${lastName}</td>
                        <td><img src="${data.img ? 'data:image/jpeg;base64,' + data.img : 'static/images/default_author.png'}" alt="Author Image" style="width:50px;height:auto;"></td>
                        <td>
                            <img src="static/images/Edit.png" alt="Edit" class="action-icon" title="Edit Author" onclick="editAuthor(${authorID})">
                            <img src="static/images/Trash.png" alt="Delete" class="action-icon" title="Delete Author" onclick="openDeleteConfirmation('author', ${authorID})">
                        </td>
                    `;
                }
            }
            updateAuthorDropdowns({ authorID, full_name: `${firstName} ${lastName}` });
        } else {
            showNotification('Error updating author: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while updating the author', 'error');
    }
}

function closeEditUserForm() {
    closeFrame('editUserFormContainer');
}

function closeEditBookForm() {
    closeFrame('editBookFormContainer');
}

function closeEditAuthorForm() {
    closeFrame('editAuthorFormContainer');
}
