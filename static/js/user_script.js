document.addEventListener('DOMContentLoaded', function() {
    const libraryText = document.getElementById('library-logo');
    const userLoginForm = document.getElementById('user-login-form');
    const editProfileIcon = document.getElementById('edit-profile-icon');

    if (libraryText) {
        libraryText.addEventListener('click', function(event) {
            event.preventDefault();
            if (userLoginForm) {
                userLoginForm.style.display = 'none';
            }
            window.location.href = '/';
        });
    }

    if (editProfileIcon) {
        editProfileIcon.addEventListener('click', function() {
            openEditProfile();
        });
    }

    const modal = document.querySelector('.modal');
    const closeButton = document.querySelector('.close-button');

    if (closeButton) {
        closeButton.addEventListener('click', function() {
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    const rectangles = document.querySelectorAll('.rectangle');
    rectangles.forEach(rectangle => {
        const imageUrl = rectangle.getAttribute('data-image');
        rectangle.style.backgroundImage = `url('${imageUrl}')`;
    });

    checkOverdueBooks();
});

function openFrame(frameId) {
    document.getElementById(frameId).style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    document.body.classList.add('no-scroll');
    document.querySelector('.content-wrapper').classList.add('blur');
}

function closeFrame(frameId) {
    document.getElementById(frameId).style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.body.classList.remove('no-scroll');
    document.querySelector('.content-wrapper').classList.remove('blur');
}

function openEditProfile() {
    openFrame('editProfileFrame');
    fetchUserDetails();
}

function closeEditProfile() {
    closeFrame('editProfileFrame');
}

function openAuthorList() {
    openFrame('authorListFrame');
    fetchAuthors();
}

function closeAuthorList() {
    closeFrame('authorListFrame');
}

function openBookList() {
    openFrame('bookListFrame');
    fetchBooks();
}

function closeBookList() {
    closeFrame('bookListFrame');
}

function openBorrowHistory() {
    openFrame('borrowHistoryFrame');
    fetchBorrowHistory();
}

function closeBorrowHistory() {
    closeFrame('borrowHistoryFrame');
}

function openBorrowBook() {
    openFrame('borrowBookFrame');
    fetchAvailableBooks();
}

function closeBorrowBook() {
    closeFrame('borrowBookFrame');
}

function openReturnBook() {
    openFrame('returnBookFrame');
    fetchBorrowedBooks();
}

function closeReturnBook() {
    closeFrame('returnBookFrame');
}

async function fetchUserDetails() {
    try {
        const response = await fetch('/get_user_details');
        const data = await response.json();
        if (data.success) {
            document.getElementById('firstName').value = data.user.first_name;
            document.getElementById('lastName').value = data.user.last_name;
            document.getElementById('city').value = data.user.city;
            document.getElementById('street').value = data.user.street; // Changed to lowercase 'street'
            document.getElementById('age').value = data.user.age;
            // Store librarianID in a hidden input
            if (data.user.librarianID) {
                const librarianInput = document.createElement('input');
                librarianInput.type = 'hidden';
                librarianInput.name = 'librarianID';
                librarianInput.value = data.user.librarianID;
                document.getElementById('edit-profile-form').appendChild(librarianInput);
            }
        } else {
            showNotification('Failed to load user details: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        showNotification('An error occurred while fetching user details.', 'error');
    }
}

async function fetchAuthors() {
    try {
        const response = await fetch('/get_author_list');
        const data = await response.json();
        const tableBody = document.querySelector('#authorTable tbody');
        tableBody.innerHTML = '';
        data.forEach(author => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${author.first_name} ${author.last_name}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching authors:', error);
    }
}

async function fetchBooks() {
    try {
        const response = await fetch('/get_book_list');
        const data = await response.json();
        const bookContainer = document.querySelector('#bookListFrame .book-container');
        bookContainer.innerHTML = '';

        // Process books in pairs
        for (let i = 0; i < data.length; i += 2) {
            const row = document.createElement('div');
            row.className = 'book-row';

            // First book in the pair
            const field1 = document.createElement('div');
            field1.className = 'book-field';
            field1.innerHTML = `
                ${data[i].img ? `<img src="data:image/png;base64,${data[i].img}" alt="Cover of ${data[i].book_name} by ${data[i].authors}" class="book-image">` : '<div class="no-image">No Image</div>'}
                <div class="book-details">
                    <strong>${data[i].book_name}</strong>
                    <p>Genre: ${data[i].genre || 'N/A'}</p>
                    <p>Year: ${data[i].publicationyear}</p>
                    <p>Author: ${data[i].authors}</p>
                </div>
            `;
            row.appendChild(field1);

            // Second book in the pair (if exists)
            const field2 = document.createElement('div');
            field2.className = 'book-field';
            if (i + 1 < data.length) {
                field2.innerHTML = `
                    ${data[i + 1].img ? `<img src="data:image/png;base64,${data[i + 1].img}" alt="Cover of ${data[i + 1].book_name} by ${data[i + 1].authors}" class="book-image">` : '<div class="no-image">No Image</div>'}
                    <div class="book-details">
                        <strong>${data[i + 1].book_name}</strong>
                        <p>Genre: ${data[i + 1].genre || 'N/A'}</p>
                        <p>Year: ${data[i + 1].publicationyear}</p>
                        <p>Author: ${data[i + 1].authors}</p>
                    </div>
                `;
            }
            row.appendChild(field2);

            bookContainer.appendChild(row);
        }

        if (!data.length) {
            bookContainer.innerHTML = '<div class="no-books">No books available.</div>';
        }
    } catch (error) {
        console.error('Error fetching book list:', error);
        document.querySelector('#bookListFrame .book-container').innerHTML = '<div class="no-books">Error loading books. Please try again later.</div>';
    }
}

async function fetchBorrowHistory() {
    try {
        const response = await fetch('/get_borrow_history');
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Fetch error:', errorData);
            throw new Error(errorData.message || 'Failed to fetch borrow history');
        }
        const data = await response.json();
        console.log('Borrow history data:', data); // Debug log
        const bookContainer = document.querySelector('#borrowHistoryContainer');
        bookContainer.innerHTML = '';

        // Process records in pairs
        for (let i = 0; i < data.length; i += 2) {
            const row = document.createElement('div');
            row.className = 'book-row';

            // First record in the pair
            const field1 = document.createElement('div');
            field1.className = 'book-field';
            field1.innerHTML = `
                ${data[i].img ? `<img src="data:image/png;base64,${data[i].img}" alt="Cover of ${data[i].book_name} by ${data[i].authors}" class="book-image">` : '<div class="no-image">No Image</div>'}
                <div class="book-details">
                    <strong>${data[i].book_name}</strong>
                    <p>Loan ID: ${data[i].loanID}</p>
                    <p>ISBN: ${data[i].ISBN}</p>
                    <p>Author: ${data[i].authors}</p>
                    <p>Loan Date: ${data[i].loan_date || 'N/A'}</p>
                    <p>Return Date: ${data[i].return_date || 'Not Returned'}</p>
                </div>
            `;
            row.appendChild(field1);

            // Second record in the pair (if exists)
            const field2 = document.createElement('div');
            field2.className = 'book-field';
            if (i + 1 < data.length) {
                field2.innerHTML = `
                    ${data[i + 1].img ? `<img src="data:image/png;base64,${data[i + 1].img}" alt="Cover of ${data[i + 1].book_name} by ${data[i + 1].authors}" class="book-image">` : '<div class="no-image">No Image</div>'}
                    <div class="book-details">
                        <strong>${data[i + 1].book_name}</strong>
                        <p>Loan ID: ${data[i + 1].loanID}</p>
                        <p>ISBN: ${data[i + 1].ISBN}</p>
                        <p>Author: ${data[i + 1].authors}</p>
                        <p>Loan Date: ${data[i + 1].loan_date || 'N/A'}</p>
                        <p>Return Date: ${data[i + 1].return_date || 'Not Returned'}</p>
                    </div>
                `;
            }
            row.appendChild(field2);

            bookContainer.appendChild(row);
        }

        if (!data.length) {
            bookContainer.innerHTML = '<div class="no-books">No borrow history available.</div>';
        }
    } catch (error) {
        console.error('Error fetching borrow history:', error);
        document.querySelector('#borrowHistoryContainer').innerHTML = `<div class="no-books">Error: ${error.message}. Please try again later.</div>`;
    }
}

async function fetchAvailableBooks() {
    try {
        const response = await fetch('/get_available_books');
        const data = await response.json();
        const bookContainer = document.querySelector('#availableBooksContainer');
        bookContainer.innerHTML = '';

        // Process books in pairs
        for (let i = 0; i < data.length; i += 2) {
            const row = document.createElement('div');
            row.className = 'book-row';

            // First book in the pair
            const field1 = document.createElement('div');
            field1.className = 'book-field';
            field1.innerHTML = `
                ${data[i].img ? `<img src="data:image/png;base64,${data[i].img}" alt="Cover of ${data[i].book_name} by ${data[i].authors}" class="book-image">` : '<div class="no-image">No Image</div>'}
                <div class="book-details">
                    <strong>${data[i].book_name}</strong>
                    <p>Genre: ${data[i].genre || 'N/A'}</p>
                    <p>Year: ${data[i].publicationyear}</p>
                    <p>Author: ${data[i].authors}</p>
                    <img src="static/images/Borrow.png" alt="Borrow ${data[i].book_name}" class="action-icon" title="Borrow Book" onclick="borrowBook('${data[i].ISBN}')">
                </div>
            `;
            row.appendChild(field1);

            // Second book in the pair (if exists)
            const field2 = document.createElement('div');
            field2.className = 'book-field';
            if (i + 1 < data.length) {
                field2.innerHTML = `
                    ${data[i + 1].img ? `<img src="data:image/png;base64,${data[i + 1].img}" alt="Cover of ${data[i + 1].book_name} by ${data[i + 1].authors}" class="book-image">` : '<div class="no-image">No Image</div>'}
                    <div class="book-details">
                        <strong>${data[i + 1].book_name}</strong>
                        <p>Genre: ${data[i + 1].genre || 'N/A'}</p>
                        <p>Year: ${data[i + 1].publicationyear}</p>
                        <p>Author: ${data[i + 1].authors}</p>
                        <img src="static/images/Borrow.png" alt="Borrow ${data[i + 1].book_name}" class="action-icon" title="Borrow Book" onclick="borrowBook('${data[i + 1].ISBN}')">
                    </div>
                `;
            }
            row.appendChild(field2);

            bookContainer.appendChild(row);
        }

        if (!data.length) {
            bookContainer.innerHTML = '<div class="no-books">No books available to borrow.</div>';
        }
    } catch (error) {
        console.error('Error fetching available books:', error);
        document.querySelector('#availableBooksContainer').innerHTML = '<div class="no-books">Error loading books. Please try again later.</div>';
    }
}

async function fetchBorrowedBooks() {
    try {
        const response = await fetch('/get_borrowed_books');
        const data = await response.json();
        const bookContainer = document.querySelector('#borrowedBooksContainer');
        bookContainer.innerHTML = '';

        // Process books in pairs
        for (let i = 0; i < data.length; i += 2) {
            const row = document.createElement('div');
            row.className = 'book-row';

            // First book in the pair
            const field1 = document.createElement('div');
            field1.className = 'book-field';
            field1.innerHTML = `
                ${data[i].img ? `<img src="data:image/png;base64,${data[i].img}" alt="Cover of ${data[i].book_name} by ${data[i].authors}" class="book-image">` : '<div class="no-image">No Image</div>'}
                <div class="book-details">
                    <strong>${data[i].book_name}</strong>
                    <p>Genre: ${data[i].genre || 'N/A'}</p>
                    <p>Year: ${data[i].publicationyear}</p>
                    <p>Author: ${data[i].authors}</p>
                    <img src="static/images/Return.png" alt="Return ${data[i].book_name}" class="action-icon" title="Return Book" onclick="returnBook('${data[i].ISBN}')">
                </div>
            `;
            row.appendChild(field1);

            // Second book in the pair (if exists)
            const field2 = document.createElement('div');
            field2.className = 'book-field';
            if (i + 1 < data.length) {
                field2.innerHTML = `
                    ${data[i + 1].img ? `<img src="data:image/png;base64,${data[i + 1].img}" alt="Cover of ${data[i + 1].book_name} by ${data[i + 1].authors}" class="book-image">` : '<div class="no-image">No Image</div>'}
                    <div class="book-details">
                        <strong>${data[i + 1].book_name}</strong>
                        <p>Genre: ${data[i + 1].genre || 'N/A'}</p>
                        <p>Year: ${data[i + 1].publicationyear}</p>
                        <p>Author: ${data[i + 1].authors}</p>
                        <img src="static/images/Return.png" alt="Return ${data[i + 1].book_name}" class="action-icon" title="Return Book" onclick="returnBook('${data[i + 1].ISBN}')">
                    </div>
                `;
            }
            row.appendChild(field2);

            bookContainer.appendChild(row);
        }

        if (!data.length) {
            bookContainer.innerHTML = '<div class="no-books">No books currently borrowed.</div>';
        }
    } catch (error) {
        console.error('Error fetching borrowed books:', error);
        document.querySelector('#borrowedBooksContainer').innerHTML = '<div class="no-books">Error loading books. Please try again later.</div>';
    }
}

async function borrowBook(ISBN) {
    try {
        const response = await fetch('/borrow_book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ISBN: ISBN })
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Book borrowed successfully!', 'success');
            closeBorrowBook();
            fetchBorrowHistory();
        } else {
            showNotification('Failed to borrow book.', 'error');
        }
    } catch (error) {
        console.error('Error borrowing book:', error);
        showNotification('An error occurred while borrowing the book.', 'error');
    }
}

async function returnBook(ISBN) {
    try {
        const response = await fetch('/return_book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ISBN: ISBN })
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Book returned successfully!', 'success');
            closeReturnBook();
            fetchBorrowHistory();
        } else {
            showNotification('Failed to return book.', 'error');
        }
    } catch (error) {
        console.error('Error returning book:', error);
        showNotification('An error occurred while returning the book.', 'error');
    }
}

async function checkOverdueBooks() {
    try {
        const response = await fetch('/check_overdue_books');
        const data = await response.json();
        if (data.success && data.overdue_books && data.overdue_books.length > 0) {
            data.overdue_books.forEach(book => {
                showNotification(
                    `Return book "${book.book_name}" (ISBN: ${book.ISBN}) soon!`,
                    'error',
                    5000
                );
            });
        }
    } catch (error) {
        console.error('Error checking overdue books:', error);
    }
}

async function saveProfileChanges(event) {
    event.preventDefault();
    const form = document.getElementById('edit-profile-form');
    const formData = new FormData(form);
    const userID = formData.get('userID');
    const firstName = formData.get('firstName').trim();
    const lastName = formData.get('lastName').trim();
    const city = formData.get('city').trim();
    const street = formData.get('street').trim();
    const age = parseInt(formData.get('age'));
    const librarianID = formData.get('librarianID'); // Get librarianID from form

    // Client-side validation
    if (!userID) {
        showNotification('User ID is missing. Please log in again.', 'error');
        console.log('Validation failed: Missing userID');
        return;
    }
    if (!firstName || !lastName || !city || !street || !librarianID) {
        showNotification('All fields are required, including librarian ID.', 'error');
        console.log('Validation failed: Empty fields detected.');
        return;
    }
    if (isNaN(age) || age <= 0) {
        showNotification('Please enter a valid age.', 'error');
        console.log('Validation failed: Invalid age value:', age);
        return;
    }

    console.log('Sending profile update with data:', {
        userID,
        firstName,
        lastName,
        city,
        street,
        age,
        librarianID
    });

    try {
        const response = await fetch('/edit_user', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Profile updated successfully!', 'success');
            closeEditProfile();
            const welcomeMessage = document.querySelector('.content-wrapper h2');
            welcomeMessage.textContent = `Welcome, ${firstName} ${lastName} as User!`;
        } else {
            console.log('Server returned failure:', data.message);
            showNotification('Failed to update profile: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Fetch error updating profile:', error);
        showNotification('Failed to update profile: An error occurred.', 'error');
    }
}

function showNotification(message, type, duration = 3000) {
    const notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        console.error("Notification container not found!");
        return;
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerText = message;
    notification.style.opacity = 0;
    notification.style.transform = 'translateX(100%)';
    notificationContainer.appendChild(notification);

    let opacity = 0;
    const fadeInInterval = setInterval(() => {
        if (opacity >= 1) {
            clearInterval(fadeInInterval);
        } else {
            opacity += 0.1;
            notification.style.opacity = opacity;
            notification.style.transform = `translateX(${100 - (opacity * 100)}%)`;
        }
    }, 30);

    setTimeout(() => {
        let fadeOutInterval = setInterval(() => {
            if (opacity <= 0) {
                clearInterval(fadeOutInterval);
                notification.remove();
            } else {
                opacity -= 0.1;
                notification.style.opacity = opacity;
                notification.style.transform = `translateX(${100 - (opacity * 100)}%)`;
            }
        }, 30);
    }, duration);
}

document.addEventListener('DOMContentLoaded', function() {
    const editProfileForm = document.getElementById('edit-profile-form');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', saveProfileChanges);
    }
});
