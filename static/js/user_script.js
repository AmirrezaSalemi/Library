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

    // بررسی کتاب‌های تأخیری هنگام بارگذاری صفحه
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
        const tableBody = document.querySelector('#bookTable tbody');
        tableBody.innerHTML = '';
        data.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.book_name}</td>
                <td>${book.genre || ' '}</td>
                <td>${book.publicationyear}</td>
                <td>${book.authors}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching book list:', error);
    }
}

async function fetchBorrowHistory() {
    try {
        const response = await fetch('/get_borrow_history');
        const data = await response.json();
        const tableBody = document.querySelector('#borrowHistoryTable tbody');
        tableBody.innerHTML = '';
        data.forEach(borrow => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${borrow.loanID}</td>
                <td>${borrow.ISBN}</td>
                <td>${borrow.book_name}</td>
                <td>${borrow.loan_date}</td>
                <td>${borrow.return_date || ' '}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching borrow history:', error);
    }
}

async function fetchAvailableBooks() {
    try {
        const response = await fetch('/get_available_books');
        const data = await response.json();
        const tableBody = document.querySelector('#availableBooksTable tbody');
        tableBody.innerHTML = '';
        data.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.book_name}</td>
                <td>${book.genre}</td>
                <td>${book.publicationyear}</td>
                <td>${book.authors}</td>
                <td><img src="static/images/Borrow.png" alt="Borrow" class="action-icon" title="Borrow Book" onclick="borrowBook('${book.ISBN}')"></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching available books:', error);
    }
}

async function fetchBorrowedBooks() {
    try {
        const response = await fetch('/get_borrowed_books');
        const data = await response.json();
        const tableBody = document.querySelector('#borrowedBooksTable tbody');
        tableBody.innerHTML = '';
        data.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.book_name}</td>
                <td>${book.genre}</td>
                <td>${book.publicationyear}</td>
                <td>${book.authors}</td>
                <td><img src="static/images/Return.png" alt="Return" class="action-icon" title="Return Book" onclick="returnBook('${book.ISBN}')"></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching borrowed books:', error);
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
            // نمایش نوتیفیکیشن برای هر کتاب تأخیری
            data.overdue_books.forEach(book => {
                showNotification(
                    `Return book "${book.book_name}" (ISBN: ${book.ISBN}) soon!`,
                    'error',
                    5000 // نمایش به مدت 5 ثانیه
                );
            });
        }
    } catch (error) {
        console.error('Error checking overdue books:', error);
    }
}

function showNotification(message, type, duration = 3000) {
    const notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        console.error("Notification container not found!");
        return;
    }

    // ایجاد یک المان نوتیفیکیشن جدید
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerText = message;
    notification.style.opacity = 0; // شروع با opacity 0
    notification.style.transform = 'translateX(100%)'; // شروع از خارج صفحه
    notificationContainer.appendChild(notification);

    // نمایش نوتیفیکیشن با افزایش تدریجی opacity و حرکت به داخل
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

    // حذف نوتیفیکیشن پس از مدت زمان مشخص
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
    }, duration); // استفاده از مدت زمان دلخواه (پیش‌فرض 3 ثانیه)
}