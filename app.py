from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import mysql.connector
import traceback

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

@app.route('/test_connection')
def test_connection():
    try:
        connection = connecting()
        if connection.is_connected():
            return "Connected to the database successfully!"
    except Exception as e:
        return f"Error connecting to the database: {e}"
    finally:
        if connection.is_connected():
            connection.close()

@app.route('/add_author', methods=['POST'])
def add_author():
    authorID = request.form.get('authorID')
    firstName = request.form.get('firstName')
    lastName = request.form.get('lastName')

    connection = connecting()
    cursor = connection.cursor()
    try:
        cursor.execute("INSERT INTO author (authorID, first_name, last_name) VALUES (%s, %s, %s)",
                       (authorID, firstName, lastName))
        connection.commit()
        return jsonify({"success": True})
    except Exception as e:
        connection.rollback()
        print(f"Error adding author: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/add_librarian', methods=['POST'])
def add_librarian():
    librarianID = request.form.get('librarianID')
    firstName = request.form.get('firstName')
    lastName = request.form.get('lastName')

    connection = connecting()
    cursor = connection.cursor()
    try:
        cursor.execute("INSERT INTO librarian (librarianID, first_name, last_name) VALUES (%s, %s, %s)",
                       (librarianID, firstName, lastName))
        connection.commit()
        return jsonify({"success": True})
    except Exception as e:
        connection.rollback()
        print(f"Error adding librarian: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/add_user_route', methods=['POST'])
def add_user_route():
    print(f"Received form data: {request.form}")
    try:
        userID = request.form.get('userID')
        firstName = request.form.get('firstName')
        lastName = request.form.get('lastName')
        city = request.form.get('city')
        street = request.form.get('street')
        age = request.form.get('age')
        librarianID = session.get('librarian_id')  # Retrieve librarianID from session

        if not librarianID:
            return jsonify({"success": False, "message": "Librarian ID not found in session"}), 400

        connection = connecting()
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO usr (userID, librarianID, first_name, last_name, city, Street, age) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (userID, librarianID, firstName, lastName, city, street, age))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"success": True})
    except mysql.connector.Error as err:
        print(f"MySQL Error: {err}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(err)}), 500
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

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
        print(f"Error adding book: {e}")
        traceback.print_exc()
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
        print(f"Error borrowing book: {e}")
        traceback.print_exc()
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
        print(f"Error returning book: {e}")
        traceback.print_exc()
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
    print(f"Librarian ID stored in session: {librarian_id}")
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

@app.route('/delete_user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    connection = connecting()
    cursor = connection.cursor()
    try:
        print(f"Deleting user with ID: {user_id}")
        cursor.execute("UPDATE book SET userID = NULL WHERE userID = %s", (user_id,))
        print(f"Updated book table for user ID: {user_id}")
        cursor.execute("DELETE FROM usr WHERE userID = %s", (user_id,))
        print(f"Deleted user with ID: {user_id}")
        connection.commit()
        return jsonify({"success": True})
    except Exception as e:
        connection.rollback()
        print(f"Error deleting user: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/delete_book/<string:ISBN>', methods=['DELETE'])
def delete_book(ISBN):
    connection = connecting()
    cursor = connection.cursor()
    try:
        print(f"Deleting book with ISBN: {ISBN}")
        cursor.execute("DELETE FROM book WHERE ISBN = %s", (ISBN,))
        print(f"Deleted book with ISBN: {ISBN}")
        cursor.execute("DELETE FROM authorbook WHERE ISBN = %s", (ISBN,))
        print(f"Deleted authorbook entries for ISBN: {ISBN}")
        connection.commit()
        return jsonify({"success": True})
    except Exception as e:
        connection.rollback()
        print(f"Error deleting book: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/delete_author/<int:author_id>', methods=['DELETE'])
def delete_author(author_id):
    connection = connecting()
    cursor = connection.cursor()
    try:
        print(f"Deleting author with ID: {author_id}")
        cursor.execute("DELETE FROM author WHERE authorID = %s", (author_id,))
        print(f"Deleted author with ID: {author_id}")
        cursor.execute("DELETE FROM authorbook WHERE authorID = %s", (author_id,))
        print(f"Deleted authorbook entries for author ID: {author_id}")
        connection.commit()
        return jsonify({"success": True})
    except Exception as e:
        connection.rollback()
        print(f"Error deleting author: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/get_user/<int:userID>', methods=['GET'])
def get_user(userID):
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usr WHERE userID = %s", (userID,))
    user = cursor.fetchone()
    cursor.close()
    connection.close()
    if user:
        return jsonify({'success': True, 'user': user})
    else:
        return jsonify({'success': False, 'message': 'User not found'})

@app.route('/get_book/<string:ISBN>', methods=['GET'])
def get_book(ISBN):
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("""
        SELECT book.*, GROUP_CONCAT(DISTINCT CONCAT(author.first_name, ' ', author.last_name) SEPARATOR ', ') AS authors
        FROM book
        JOIN authorbook ON book.ISBN = authorbook.ISBN
        JOIN author ON authorbook.authorID = author.authorID
        WHERE book.ISBN = %s
        GROUP BY book.ISBN
    """, (ISBN,))
    book = cursor.fetchone()

    # Fetch authors separately to get individual author details
    cursor.execute("""
        SELECT author.first_name, author.last_name
        FROM author
        JOIN authorbook ON author.authorID = authorbook.authorID
        WHERE authorbook.ISBN = %s
    """, (ISBN,))
    authors = cursor.fetchall()

    cursor.close()
    connection.close()
    if book:
        book['authors'] = authors  # Add authors to the book data
        return jsonify({'success': True, 'book': book})
    else:
        return jsonify({'success': False, 'message': 'Book not found'})

@app.route('/get_author/<int:authorID>', methods=['GET'])
def get_author(authorID):
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM author WHERE authorID = %s", (authorID,))
    author = cursor.fetchone()
    cursor.close()
    connection.close()
    if author:
        return jsonify({'success': True, 'author': author})
    else:
        return jsonify({'success': False, 'message': 'Author not found'})

@app.route('/edit_user', methods=['POST'])
def edit_user():
    userID = request.form.get('userID')
    firstName = request.form.get('firstName')
    lastName = request.form.get('lastName')
    city = request.form.get('city')
    street = request.form.get('street')
    age = request.form.get('age')

    connection = connecting()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "UPDATE usr SET first_name = %s, last_name = %s, city = %s, Street = %s, age = %s WHERE userID = %s",
            (firstName, lastName, city, street, age, userID))
        connection.commit()
        return jsonify({"success": True})
    except Exception as e:
        connection.rollback()
        print(f"Error editing user: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/edit_book', methods=['POST'])
def edit_book():
    ISBN = request.form.get('ISBN')
    bookName = request.form.get('bookName')
    genre = request.form.get('genre')
    publicationYear = request.form.get('publicationYear')
    authorFirstNames = request.form.getlist('authorFirstName[]')
    authorLastNames = request.form.getlist('authorLastName[]')

    connection = connecting()
    cursor = connection.cursor(buffered=True)  # Use a buffered cursor

    try:
        # Start a transaction
        connection.start_transaction()

        # Update the book details
        cursor.execute(
            "UPDATE book SET book_name = %s, genre = %s, publicationyear = %s WHERE ISBN = %s",
            (bookName, genre, publicationYear, ISBN))

        # Delete existing author-book relationships
        cursor.execute("DELETE FROM authorbook WHERE ISBN = %s", (ISBN,))

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
        print(f"Error editing book: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify({"success": True})

@app.route('/edit_author', methods=['POST'])
def edit_author():
    authorID = request.form.get('authorID')
    firstName = request.form.get('first_name')
    lastName = request.form.get('last_name')

    connection = connecting()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "UPDATE author SET first_name = %s, last_name = %s WHERE authorID = %s",
            (firstName, lastName, authorID))
        connection.commit()
        return jsonify({"success": True})
    except Exception as e:
        connection.rollback()
        print(f"Error editing author: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
