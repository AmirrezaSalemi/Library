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
            openFrame('bookListFrame');
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
                        <td><button onclick="borrowBook('${book.ISBN}')">Borrow</button></td>
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
                        <td><button onclick="returnBook('${book.ISBN}')">Return</button></td>
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
                    alert('Book borrowed successfully!');
                    closeBorrowBook();
                    fetchBorrowHistory();
                } else {
                    alert('Failed to borrow book.');
                }
            } catch (error) {
                console.error('Error borrowing book:', error);
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
                    alert('Book returned successfully!');
                    closeReturnBook();
                    fetchBorrowHistory();
                } else {
                    alert('Failed to return book.');
                }
            } catch (error) {
                console.error('Error returning book:', error);
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            const rectangles = document.querySelectorAll('.rectangle');
            rectangles.forEach(rectangle => {
                const imageUrl = rectangle.getAttribute('data-image');
                rectangle.style.backgroundImage = `url('${imageUrl}')`;
            });
        });