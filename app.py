from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import mysql.connector

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Add a secret key for flash messages


def connecting():
    connection = mysql.connector.connect(
        host='localhost',
        database='librarydb',
        user='root',
        password='3490551389'
    )
    if connection.is_connected():
        print('Connected to MySQL database')
        return connection


@app.route('/get_librarians')
def get_librarians():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(
        "SELECT DISTINCT Librarian.* "
        "FROM Librarian, Usr "
        "WHERE Librarian.librarianID = Usr.librarianID "
        "AND city = 'Bushehr';")
    librarians = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(librarians)


@app.route('/get_authors')
def get_authors():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT DISTINCT author.* "
                   "FROM author, authorbook, book "
                   "WHERE author.authorID = authorbook.authorID "
                   "AND authorbook.ISBN = book.ISBN "
                   "AND genre = 'Action' "
                   "AND publicationyear = 2003;")
    authors = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(authors)


@app.route('/get_users')
def get_users():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT Usr.* FROM Usr, Book, AuthorBook, Author, Borrow WHERE Usr.userID = Borrow.userID AND "
                   "Borrow.ISBN = Book.ISBN AND Book.ISBN = AuthorBook.ISBN AND AuthorBook.authorID = Author.authorID "
                   "AND book_name = 'Die Verwandlung' AND Author.first_name = 'Franz' AND Author.last_name = 'Kafka';")
    users = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(users)


@app.route('/get_names')
def get_names():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT DISTINCT Author.first_name, Author.last_name "
                   "FROM Author, AuthorBook, Book "
                   "WHERE Author.authorID = AuthorBook.authorID "
                   "AND AuthorBook.ISBN = Book.ISBN "
                   "AND book_name = 'War and Peace';")
    names = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(names)


@app.route('/get_authors_query5')
def get_authors_query5():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT DISTINCT Author.* "
                   "FROM Author "
                   "INNER JOIN AuthorBook "
                   "ON Author.authorID = AuthorBook.authorID "
                   "INNER JOIN Book "
                   "ON AuthorBook.ISBN = Book.ISBN "
                   "WHERE publicationyear NOT IN (2020, 2024);")
    authors = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(authors)


@app.route('/run_query6')
def run_query6():
    connection = connecting()
    cursor = connection.cursor()
    try:
        # Start a transaction
        connection.start_transaction()

        cursor.execute("CREATE TEMPORARY TABLE temp_isbns AS SELECT ISBN FROM Book WHERE publicationyear > 20000;")
        cursor.execute("DELETE FROM Book WHERE ISBN IN (SELECT ISBN FROM temp_isbns);")
        cursor.execute("DROP TEMPORARY TABLE temp_isbns;")

        # Commit the transaction if all queries are successful
        connection.commit()

    except Exception as e:
        # Roll back the transaction if any query fails
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()
    return jsonify({"message": "DONE!"})


@app.route('/run_query7')
def run_query7():
    connection = connecting()
    cursor = connection.cursor()
    try:
        # Start a transaction
        connection.start_transaction()

        cursor.execute("""
            UPDATE author
            SET first_name = 'Bohumil', last_name = 'Hrabal'
            WHERE authorID IN (
                SELECT authorID
                FROM (
                    SELECT athr.authorID
                    FROM author AS athr
                    WHERE athr.first_name = 'Baomil' AND athr.last_name = 'Harabal'
                ) AS temp
            );
        """)

        # Commit the transaction if all queries are successful
        connection.commit()

    except Exception as e:
        # Roll back the transaction if any query fails
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()
    return jsonify({"message": "DONE!"})


@app.route('/get_avg_age_query8')
def get_avg_age_query8():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("""
        SELECT AVG(Usr.age) AS average_age
        FROM Usr
        WHERE Usr.userID IN (
            SELECT DISTINCT Borrow.userID
            FROM Borrow, Book, AuthorBook, Author
            WHERE Borrow.ISBN = Book.ISBN
            AND Book.ISBN = AuthorBook.ISBN
            AND AuthorBook.authorID = Author.authorID
            AND Author.first_name = 'Sadegh'
            AND Author.last_name = 'Hedayat');
    """)
    result = cursor.fetchone()
    cursor.close()
    connection.close()
    return jsonify(result)


@app.route('/get_librarians_query9')
def get_librarians_query9():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT DISTINCT Librarian.* "
                   "FROM Librarian, Book "
                   "WHERE Librarian.librarianID = Book.librarianID "
                   "AND book_name = 'Harry Potter';")
    librarians = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(librarians)


@app.route('/get_isbns_query10')
def get_isbns_query10():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT Book.ISBN FROM Book, AuthorBook, Author WHERE first_name = 'Joanne' AND last_name =  "
                   "'Rowling' AND Author.authorID = AuthorBook.authorID AND AuthorBook.ISBN = Book.ISBN;")
    isbns = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(isbns)


@app.route('/get_users_query11')
def get_users_query11():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * "
                   "FROM Usr "
                   "WHERE Usr.age = ( SELECT MAX(Usr1.age) "
                   "                  FROM Usr AS Usr1 "
                   "                  WHERE Usr1.age < ( SELECT MAX(Ussr.age) "
                   "                                     FROM Usr AS Ussr));")
    users = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(users)


@app.route('/get_users_query12')
def get_users_query12():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT Usr.* "
                   "FROM Usr, Author "
                   "WHERE Usr.last_name = Author.last_name "
                   "AND Usr.first_name = Author.first_name;")
    users = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(users)


@app.route('/get_librarians_query13')
def get_librarians_query13():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT DISTINCT Librarian.* "
                   "FROM Librarian, book "
                   "WHERE book.librarianID = librarian.librarianID "
                   "AND genre = 'Action'")
    librarians = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(librarians)


@app.route('/get_first_names_query14')
def get_first_names_query14():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT first_name "
                   "FROM Usr, Book, Borrow "
                   "WHERE Usr.userID = borrow.userID "
                   "AND Book.ISBN = Borrow.ISBN AND book_name = 'Germinal';")
    first_names = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(first_names)


@app.route('/get_authors_query15')
def get_authors_query15():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT Author.* FROM Author, AuthorBook, Book WHERE Author.authorID = AuthorBook.authorID AND "
                   "AuthorBook.ISBN = Book.ISBN AND book_name = 'Hobbits' UNION SELECT Author.* FROM Author, "
                   "AuthorBook, Book WHERE Author.authorID = AuthorBook.authorID AND AuthorBook.ISBN = Book.ISBN AND "
                   "book_name = 'Lord of the rings';")
    authors = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(authors)


@app.route('/run_custom_query', methods=['POST'])
def run_custom_query():
    data = request.get_json()
    query = data.get('query')

    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(query)
        result = cursor.fetchall()
        connection.commit()
    except Exception as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()
    return jsonify({"result": result})


@app.route('/add_author', methods=['POST'])
def add_author():
    authorID = request.form.get('authorID')
    firstName = request.form.get('firstName')
    lastName = request.form.get('lastName')

    connection = connecting()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO author (authorID, first_name, last_name) VALUES (%s, %s, %s)",
                   (authorID, firstName, lastName))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({"success": True})


@app.route('/add_librarian', methods=['POST'])
def add_librarian():
    librarianID = request.form.get('librarianID')
    firstName = request.form.get('firstName')
    lastName = request.form.get('lastName')

    connection = connecting()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO librarian (librarianID, first_name, last_name) VALUES (%s, %s, %s)",
                   (librarianID, firstName, lastName))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({"success": True})


@app.route('/add_user_route', methods=['POST'])
def add_user_route():
    userID = request.form.get('userID')
    firstName = request.form.get('firstName')
    lastName = request.form.get('lastName')
    city = request.form.get('city')
    street = request.form.get('street')
    age = request.form.get('age')
    librarianID = session.get('librarian_id')  # Retrieve librarianID from session

    connection = connecting()
    cursor = connection.cursor()
    cursor.execute(
        "INSERT INTO usr (userID, librarianID, first_name, last_name, city, street, age) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (userID, librarianID, firstName, lastName, city, street, age))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({"success": True})


@app.route('/add_book', methods=['POST'])
def add_book():
    bookName = request.form.get('bookName')
    ISBN = request.form.get('ISBN')
    genre = request.form.get('genre')
    publicationYear = request.form.get('publicationYear')
    librarianID = session.get('librarian_id')  # Retrieve librarianID from session
    authorFirstNames = request.form.getlist('authorFirstName[]')
    authorLastNames = request.form.getlist('authorLastName[]')

    connection = connecting()
    cursor = connection.cursor(buffered=True)  # Use a buffered cursor

    try:
        # Start a transaction
        connection.start_transaction()

        # Insert the book into the Book table
        cursor.execute(
            "INSERT INTO book (book_name, ISBN, genre, publicationyear, librarianID) VALUES (%s, %s, %s, %s, %s)",
            (bookName, ISBN, genre, publicationYear, librarianID))

        for firstName, lastName in zip(authorFirstNames, authorLastNames):
            # Find the authorID based on the author's first and last name
            cursor.execute("SELECT authorID FROM author WHERE first_name = %s AND last_name = %s",
                           (firstName, lastName))
            author = cursor.fetchone()

            if author:
                authorID = author[0]
                # Insert the book and author relationship into the AuthorBook table
                cursor.execute("INSERT INTO authorbook (ISBN, authorID) VALUES (%s, %s)", (ISBN, authorID))
            else:
                raise ValueError(f"Author {firstName} {lastName} not found")

        # Commit the transaction if all queries are successful
        connection.commit()

    except Exception as e:
        # Roll back the transaction if any query fails
        connection.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify({"success": True})


@app.route('/get_book_list')
def get_book_list():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("""
        SELECT book.ISBN, book_name, genre, publicationyear,
               GROUP_CONCAT(DISTINCT CONCAT(librarian.first_name, ' ', librarian.last_name) SEPARATOR ', ') AS librarians,
               GROUP_CONCAT(DISTINCT CONCAT(author.first_name, ' ', author.last_name) SEPARATOR ', ') AS authors
        FROM book
        JOIN authorbook ON book.ISBN = authorbook.ISBN
        JOIN author ON authorbook.authorID = author.authorID
        JOIN librarian ON book.librarianID = librarian.librarianID
        GROUP BY book.ISBN, book_name, genre, publicationyear, book.librarianID ORDER BY book_name;
    """)
    books = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(books)


@app.route('/get_author_list')
def get_author_list():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT authorID, first_name, last_name FROM author")
    authors = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(authors)


@app.route('/get_borrow_history')
def get_borrow_history():
    userID = session.get('userID')  # Retrieve userID from session
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT borrow.*, book_name FROM borrow, book WHERE borrow.ISBN = book.ISBN AND borrow.userID = %s",
                   (userID,))
    borrows = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(borrows)


@app.route('/get_available_books')
def get_available_books():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("""
        SELECT book.ISBN, book_name, genre, publicationyear, GROUP_CONCAT(CONCAT(author.first_name, ' ', author.last_name) SEPARATOR ', ') AS authors
        FROM book, authorbook, author
        WHERE book.userID IS NULL AND authorbook.ISBN = book.ISBN AND authorbook.authorID = author.authorID
        GROUP BY book.ISBN
        ORDER BY genre, book_name;
    """)
    books = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(books)


@app.route('/borrow_book', methods=['POST'])
def borrow_book():
    data = request.get_json()
    ISBN = data.get('ISBN')
    userID = session.get('userID')  # Retrieve userID from session

    connection = connecting()
    cursor = connection.cursor()
    try:
        # Start a transaction
        connection.start_transaction()

        cursor.execute("INSERT INTO borrow (ISBN, userID, loan_date) VALUES (%s, %s, NOW())", (ISBN, userID))
        cursor.execute("UPDATE book SET userID = %s WHERE ISBN = %s", (userID, ISBN))

        # Commit the transaction if all queries are successful
        connection.commit()

    except Exception as e:
        # Roll back the transaction if any query fails
        connection.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()
    return jsonify({"success": True})


@app.route('/get_borrowed_books')
def get_borrowed_books():
    userID = session.get('userID')  # Retrieve userID from session
    if not userID:
        return jsonify({"success": False, "message": "User not logged in"}), 400

    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("""
        SELECT book.ISBN, book_name, genre, publicationyear, GROUP_CONCAT(CONCAT(author.first_name, ' ', author.last_name) SEPARATOR ', ') AS authors
        FROM book, authorbook, author, borrow
        WHERE book.ISBN = borrow.ISBN AND borrow.userID = %s AND Book.ISBN = authorbook.ISBN AND authorbook.authorID = author.authorID AND return_date IS NULL
        GROUP BY book.ISBN;
    """, (userID,))
    books = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(books)


@app.route('/return_book', methods=['POST'])
def return_book():
    data = request.get_json()
    ISBN = data.get('ISBN')
    userID = session.get('userID')  # Retrieve userID from session

    if not userID:
        return jsonify({"success": False, "message": "User not logged in"}), 400

    connection = connecting()
    cursor = connection.cursor()
    try:
        # Start a transaction
        connection.start_transaction()

        # Update the return_date in the borrow table
        cursor.execute("UPDATE borrow SET return_date = NOW() WHERE ISBN = %s AND userID = %s AND return_date IS NULL",
                       (ISBN, userID))

        # Update the userID in the book table to NULL
        cursor.execute("UPDATE book SET userID = NULL WHERE ISBN = %s", (ISBN,))

        # Commit the transaction if all queries are successful
        connection.commit()

    except Exception as e:
        # Roll back the transaction if any query fails
        connection.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()
    return jsonify({"success": True})


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/user_home')
def user_home():
    first_name = request.args.get('first_name')
    last_name = request.args.get('last_name')
    return render_template('user_home.html', first_name=first_name, last_name=last_name)


@app.route('/librarian_home')
def librarian_home():
    first_name = request.args.get('first_name')
    last_name = request.args.get('last_name')
    librarian_id = request.args.get('librarian_id')
    session['librarian_id'] = librarian_id  # Store librarianID in session
    return render_template('librarian_home.html', first_name=first_name, last_name=last_name)


@app.route('/get_user_list')
def get_user_list():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("""
    SELECT usr.librarianID, usr.first_name AS userFirstName, usr.last_name AS userLastName, usr.userID,
    librarian.first_name AS librarianFirstName, librarian.last_name AS librarianLastName
    FROM usr
    JOIN librarian ON usr.librarianID = librarian.librarianID
    """)
    users = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(users)


@app.route('/get_borrow_list')
def get_borrow_list():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT borrow.*, first_name, last_name, book_name FROM borrow, book, usr WHERE borrow.ISBN = '
                   'book.ISBN AND borrow.userID = usr.userID')
    borrows = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(borrows)


@app.route('/login', methods=['POST'])
def login():
    user_id = request.form.get('UserID')
    librarian_id = request.form.get('LibrarianID')

    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT userID, first_name, last_name FROM usr WHERE userID = %s", (user_id,))
    users = cursor.fetchall()

    cursor.execute("SELECT librarianID, first_name, last_name FROM librarian WHERE librarianID = %s", (librarian_id,))
    librarians = cursor.fetchall()

    cursor.close()
    connection.close()

    if users:
        session['userID'] = users[0]['userID']  # Store userID in session
        return redirect(url_for('user_home', first_name=users[0]['first_name'], last_name=users[0]['last_name']))
    elif librarians:
        return redirect(
            url_for('librarian_home', first_name=librarians[0]['first_name'], last_name=librarians[0]['last_name'],
                    librarian_id=librarians[0]['librarianID']))
    else:
        flash('Invalid ID', 'error')
        return redirect(url_for('index'))


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
