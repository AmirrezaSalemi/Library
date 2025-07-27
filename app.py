from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import mysql.connector
import traceback
from datetime import datetime, timedelta
import base64

app = Flask(__name__)
app.secret_key = '8585'  # Replace with a secure secret key

def connecting():
    connection = mysql.connector.connect(
        host='localhost',
        database='librarydb',
        user='root',
        password='3490551389'  # Replace with your actual MySQL password
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

@app.route('/get_session_librarian', methods=['GET'])
def get_session_librarian():
    librarian_id = session.get('librarian_id')
    if librarian_id:
        return jsonify({"librarianID": librarian_id})
    else:
        return jsonify({"librarianID": None}), 400

@app.route('/add_author', methods=['POST'])
def add_author():
    authorID = request.form.get('authorID')
    firstName = request.form.get('firstName')
    lastName = request.form.get('lastName')
    authorImage = request.files.get('authorImage')

    if authorImage and len(authorImage.read()) > 5 * 1024 * 1024:  # 5MB limit
        return jsonify({"success": False, "message": "Image size must be less than 5MB"}), 400
    if authorImage:
        authorImage.seek(0)

    connection = connecting()
    cursor = connection.cursor()
    try:
        img_data = authorImage.read() if authorImage else None
        cursor.execute(
            "INSERT INTO author (authorID, first_name, last_name, img) VALUES (%s, %s, %s, %s)",
            (authorID, firstName, lastName, img_data)
        )
        connection.commit()
        img_base64 = base64.b64encode(img_data).decode('utf-8') if img_data else None
        return jsonify({"success": True, "img": img_base64})
    except Exception as e:
        connection.rollback()
        print(f"Error adding author: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/edit_author', methods=['POST'])
def edit_author():
    authorID = request.form.get('authorID')
    firstName = request.form.get('first_name')
    lastName = request.form.get('last_name')
    authorImage = request.files.get('authorImage')

    if authorImage and len(authorImage.read()) > 5 * 1024 * 1024:  # 5MB limit
        return jsonify({"success": False, "message": "Image size must be less than 5MB"}), 400
    if authorImage:
        authorImage.seek(0)

    connection = connecting()
    cursor = connection.cursor()
    try:
        img_data = authorImage.read() if authorImage else None
        if img_data:
            cursor.execute(
                "UPDATE author SET first_name = %s, last_name = %s, img = %s WHERE authorID = %s",
                (firstName, lastName, img_data, authorID)
            )
        else:
            cursor.execute(
                "UPDATE author SET first_name = %s, last_name = %s WHERE authorID = %s",
                (firstName, lastName, authorID)
            )
        connection.commit()
        img_base64 = base64.b64encode(img_data).decode('utf-8') if img_data else None
        return jsonify({"success": True, "img": img_base64})
    except Exception as e:
        connection.rollback()
        print(f"Error updating author: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/get_author/<int:author_id>', methods=['GET'])
def get_author(author_id):
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT authorID, first_name, last_name, img FROM author WHERE authorID = %s", (author_id,))
        author = cursor.fetchone()
        if author:
            if author['img']:
                author['img'] = base64.b64encode(author['img']).decode('utf-8')
            else:
                author['img'] = None
            return jsonify({"success": True, "author": author})
        else:
            return jsonify({"success": False, "message": "Author not found"}), 404
    except Exception as e:
        print(f"Error fetching author: {e}")
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
        cursor.execute("DELETE FROM authorbook WHERE authorID = %s", (author_id,))
        print(f"Deleted authorbook entries for author ID: {author_id}")
        cursor.execute("DELETE FROM author WHERE authorID = %s", (author_id,))
        print(f"Deleted author with ID: {author_id}")
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
        librarianID = request.form.get('librarianID') or session.get('librarian_id')

        if not librarianID:
            return jsonify({"success": False, "message": "Librarian ID not found"}), 400

        connection = connecting()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "INSERT INTO usr (userID, librarianID, first_name, last_name, city, street, age) VALUES (%s, %s, %s, %s, "
            "%s, %s, %s)",
            (userID, librarianID, firstName, lastName, city, street, age))
        connection.commit()

        cursor.execute("SELECT first_name, last_name FROM librarian WHERE librarianID = %s", (librarianID,))
        librarian = cursor.fetchone()
        return jsonify({
            "success": True,
            "librarianFirstName": librarian['first_name'] if librarian else "",
            "librarianLastName": librarian['last_name'] if librarian else ""
        })
    except mysql.connector.Error as err:
        connection.rollback()
        print(f"MySQL Error: {err}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(err)}), 500
    except Exception as e:
        connection.rollback()
        print(f"Error: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/add_book', methods=['POST'])
def add_book():
    bookName = request.form.get('bookName')
    ISBN = request.form.get('ISBN')
    genre = request.form.get('genre')
    publicationYear = request.form.get('publicationYear')
    librarianID = request.form.get('librarianID') or session.get('librarian_id')
    authorIDs = request.form.getlist('authorID[]')
    bookImage = request.files.get('bookImage')

    if not librarianID:
        return jsonify({"success": False, "message": "Librarian ID not found"}), 400

    if bookImage and len(bookImage.read()) > 5 * 1024 * 1024:  # 5MB limit
        return jsonify({"success": False, "message": "Image size must be less than 5MB"}), 400
    if bookImage:
        bookImage.seek(0)

    connection = connecting()
    cursor = connection.cursor(buffered=True, dictionary=True)

    try:
        connection.start_transaction()
        img_data = bookImage.read() if bookImage else None
        cursor.execute(
            "INSERT INTO book (book_name, ISBN, genre, publicationyear, librarianID, img) VALUES (%s, %s, %s, %s, %s, %s)",
            (bookName, ISBN, genre, publicationYear, librarianID, img_data))

        for authorID in authorIDs:
            cursor.execute("INSERT INTO authorbook (ISBN, authorID) VALUES (%s, %s)", (ISBN, authorID))

        connection.commit()

        cursor.execute("SELECT first_name, last_name FROM librarian WHERE librarianID = %s", (librarianID,))
        librarian = cursor.fetchone()
        cursor.execute(
            "SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM author WHERE authorID IN (%s)" % ','.join(
                ['%s'] * len(authorIDs)),
            authorIDs
        )
        authors = [row['full_name'] for row in cursor.fetchall()]
        img_base64 = base64.b64encode(img_data).decode('utf-8') if img_data else None
        return jsonify({
            "success": True,
            "librarians": f"{librarian['first_name']} {librarian['last_name']}" if librarian else "",
            "authors": ', '.join(authors),
            "img": img_base64
        })
    except Exception as e:
        connection.rollback()
        print(f"Error adding book: {e}")
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
    librarianID = request.form.get('librarianID') or session.get('librarian_id')
    authorIDs = request.form.getlist('authorID[]')
    bookImage = request.files.get('bookImage')

    if not librarianID:
        return jsonify({"success": False, "message": "Librarian ID not found"}), 400

    if bookImage and len(bookImage.read()) > 5 * 1024 * 1024:  # 5MB limit
        return jsonify({"success": False, "message": "Image size must be less than 5MB"}), 400
    if bookImage:
        bookImage.seek(0)

    connection = connecting()
    cursor = connection.cursor(buffered=True, dictionary=True)

    try:
        connection.start_transaction()
        img_data = bookImage.read() if bookImage else None
        if img_data:
            cursor.execute(
                "UPDATE book SET book_name = %s, genre = %s, publicationyear = %s, librarianID = %s, img = %s WHERE ISBN = %s",
                (bookName, genre, publicationYear, librarianID, img_data, ISBN)
            )
        else:
            cursor.execute(
                "UPDATE book SET book_name = %s, genre = %s, publicationyear = %s, librarianID = %s WHERE ISBN = %s",
                (bookName, genre, publicationYear, librarianID, ISBN)
            )

        cursor.execute("DELETE FROM authorbook WHERE ISBN = %s", (ISBN,))
        for authorID in authorIDs:
            cursor.execute("INSERT INTO authorbook (ISBN, authorID) VALUES (%s, %s)", (ISBN, authorID))

        connection.commit()

        cursor.execute("SELECT first_name, last_name FROM librarian WHERE librarianID = %s", (librarianID,))
        librarian = cursor.fetchone()
        cursor.execute(
            "SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM author WHERE authorID IN (%s)" % ','.join(
                ['%s'] * len(authorIDs)),
            authorIDs
        )
        authors = [row['full_name'] for row in cursor.fetchall()]
        img_base64 = base64.b64encode(img_data).decode('utf-8') if img_data else None
        return jsonify({
            "success": True,
            "librarians": f"{librarian['first_name']} {librarian['last_name']}" if librarian else "",
            "authors": ', '.join(authors),
            "img": img_base64
        })
    except Exception as e:
        connection.rollback()
        print(f"Error updating book: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/get_book/<string:ISBN>', methods=['GET'])
def get_book(ISBN):
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT ISBN, book_name, genre, publicationyear, librarianID, img FROM book WHERE ISBN = %s",
            (ISBN,)
        )
        book = cursor.fetchone()
        if book:
            cursor.execute(
                "SELECT authorID, CONCAT(first_name, ' ', last_name) AS full_name FROM author WHERE authorID IN "
                "(SELECT authorID FROM authorbook WHERE ISBN = %s)",
                (ISBN,)
            )
            authors = cursor.fetchall()
            book['authors'] = authors
            if book['img']:
                book['img'] = base64.b64encode(book['img']).decode('utf-8')
            else:
                book['img'] = None
            return jsonify({"success": True, "book": book})
        else:
            return jsonify({"success": False, "message": "Book not found"}), 404
    except Exception as e:
        print(f"Error fetching book: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/get_book_list')
def get_book_list():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                b.ISBN, 
                b.book_name, 
                b.genre, 
                b.publicationyear, 
                b.read_count,
                b.img,
                IFNULL(a.authors, 'Unknown') AS authors,
                CONCAT(l.first_name, ' ', l.last_name) AS librarians
            FROM book b
            LEFT JOIN (
                SELECT ab.ISBN, GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name) SEPARATOR ', ') AS authors
                FROM authorbook ab
                JOIN author a ON ab.authorID = a.authorID
                GROUP BY ab.ISBN
            ) a ON b.ISBN = a.ISBN
            LEFT JOIN librarian l ON b.librarianID = l.librarianID
            ORDER BY b.book_name;
        """)
        books = cursor.fetchall()
        for book in books:
            if book['img']:
                book['img'] = base64.b64encode(book['img']).decode('utf-8')
            else:
                book['img'] = None
            if not book['authors']:
                book['authors'] = "Unknown"
            if not book['librarians']:
                book['librarians'] = "Unknown"
        return jsonify(books)
    except Exception as e:
        print(f"Error fetching book list: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/get_author_list')
def get_author_list():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT authorID, first_name, last_name, img FROM author")
        authors = cursor.fetchall()
        for author in authors:
            if author['img']:
                author['img'] = base64.b64encode(author['img']).decode('utf-8')
            else:
                author['img'] = None
        return jsonify(authors)
    except Exception as e:
        print(f"Error fetching author list: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/get_most_read_authors')
def get_most_read_authors():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                authorID, 
                first_name, 
                last_name, 
                img, 
                read_count
            FROM author
            ORDER BY read_count DESC
            LIMIT 8
        """)
        authors = cursor.fetchall()
        for author in authors:
            if author['img']:
                author['img'] = base64.b64encode(author['img']).decode('utf-8')
            else:
                author['img'] = None
        return jsonify(authors)
    except Exception as e:
        print(f"Error fetching most read authors: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/get_authors_for_dropdown')
def get_authors_for_dropdown():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT authorID, CONCAT(first_name, ' ', last_name) AS full_name FROM author ORDER BY full_name")
    authors = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(authors)

@app.route('/get_borrow_history')
def get_borrow_history():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    try:
        user_id = session.get('userID')
        if not user_id:
            print("Error: No userID in session")
            return jsonify({"success": False, "message": "No userID in session"}), 400

        print(f"Fetching borrow history for userID: {user_id}")

        cursor.execute("SELECT COUNT(*) AS count FROM borrow WHERE userID = %s", (user_id,))
        count_result = cursor.fetchone()
        print(f"Borrow records count for userID {user_id}: {count_result['count']}")

        cursor.execute("""
            SELECT 
                borrow.loanID,
                borrow.ISBN,
                book.book_name,
                book.img,
                borrow.loan_date,
                borrow.return_date,
                GROUP_CONCAT(CONCAT(author.first_name, ' ', author.last_name) SEPARATOR ', ') AS authors
            FROM borrow
            JOIN book ON borrow.ISBN = book.ISBN
            LEFT JOIN authorbook ON book.ISBN = authorbook.ISBN
            LEFT JOIN author ON authorbook.authorID = author.authorID
            WHERE borrow.userID = %s
            GROUP BY borrow.loanID, borrow.ISBN, book.book_name, book.img, borrow.loan_date, borrow.return_date
            ORDER BY borrow.loan_date DESC
        """, (user_id,))
        records = cursor.fetchall()
        print(f"Retrieved {len(records)} borrow history records")

        for record in records:
            if record['img']:
                record['img'] = base64.b64encode(record['img']).decode('utf-8')
            else:
                record['img'] = None
            if not record['authors']:
                record['authors'] = "Unknown"

        return jsonify(records)
    except Exception as e:
        print(f"Error fetching borrow history: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/get_available_books')
def get_available_books():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                book.ISBN, 
                book.book_name, 
                book.genre, 
                book.publicationyear, 
                book.img,
                GROUP_CONCAT(CONCAT(author.first_name, ' ', author.last_name) SEPARATOR ', ') AS authors,
                (SELECT AVG(score) FROM comment WHERE comment.ISBN = book.ISBN) AS average_score
            FROM book
            LEFT JOIN authorbook ON book.ISBN = authorbook.ISBN
            LEFT JOIN author ON authorbook.authorID = author.authorID
            WHERE book.userID IS NULL
            GROUP BY book.ISBN
            ORDER BY book.genre, book.book_name
        """)
        books = cursor.fetchall()

        for book in books:
            if book['img']:
                book['img'] = base64.b64encode(book['img']).decode('utf-8')
            else:
                book['img'] = None
            if not book['authors']:
                book['authors'] = "Unknown"
            book['average_score'] = round(book['average_score'], 1) if book['average_score'] else None

        return jsonify(books)
    except Exception as e:
        print(f"Error fetching available books: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/borrow_book', methods=['POST'])
def borrow_book():
    data = request.get_json()
    ISBN = data.get('ISBN')
    userID = session.get('userID')

    if not userID:
        return jsonify({"success": False, "message": "User not logged in"}), 400

    connection = connecting()
    cursor = connection.cursor()
    try:
        connection.start_transaction()
        cursor.execute("INSERT INTO borrow (ISBN, userID, loan_date) VALUES (%s, %s, NOW())", (ISBN, userID))
        cursor.execute("UPDATE book SET userID = %s WHERE ISBN = %s", (userID, ISBN))
        cursor.execute("UPDATE book SET read_count = read_count + 1 WHERE ISBN = %s", (ISBN,))
        cursor.execute("""
            UPDATE author
            SET read_count = read_count + 1
            WHERE authorID IN (
                SELECT authorID FROM authorbook WHERE ISBN = %s
            )
        """, (ISBN,))
        connection.commit()
        return jsonify({"success": True})
    except Exception as e:
        connection.rollback()
        print(f"Error borrowing book: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/get_borrowed_books')
def get_borrowed_books():
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                book.ISBN, 
                book.book_name, 
                book.genre, 
                book.publicationyear, 
                book.img,
                GROUP_CONCAT(CONCAT(author.first_name, ' ', author.last_name) SEPARATOR ',') AS authors
            FROM book
            LEFT JOIN authorbook ON book.ISBN = authorbook.ISBN
            LEFT JOIN author ON authorbook.authorID = author.authorID
            WHERE book.userID = %s
            GROUP BY book.ISBN
            ORDER BY book.book_name
        """, (session['userID'],))
        books = cursor.fetchall()

        for book in books:
            if book['img']:
                book['img'] = base64.b64encode(book['img']).decode('utf-8')
            else:
                book['img'] = None
            if not book['authors']:
                book['authors'] = "Unknown"

        return jsonify(books)
    except Exception as e:
        print(f"Error fetching borrowed books: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/return_book', methods=['POST'])
def return_book():
    data = request.get_json()
    ISBN = data.get('ISBN')
    userID = session.get('userID')

    if not userID:
        return jsonify({"success": False, "message": "User not logged in"}), 400

    connection = connecting()
    cursor = connection.cursor()
    try:
        connection.start_transaction()
        cursor.execute("UPDATE borrow SET return_date = NOW() WHERE ISBN = %s AND userID = %s AND return_date IS NULL",
                       (ISBN, userID))
        cursor.execute("UPDATE book SET userID = NULL WHERE ISBN = %s", (ISBN,))
        connection.commit()
        return jsonify({"success": True, "ISBN": ISBN})
    except Exception as e:
        connection.rollback()
        print(f"Error returning book: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/add_comment', methods=['POST'])
def add_comment():
    data = request.get_json()
    ISBN = data.get('ISBN')
    userID = session.get('userID')
    message = data.get('message')
    score = data.get('score')

    if not userID:
        return jsonify({"success": False, "message": "User not logged in"}), 400
    if not ISBN or not score:
        return jsonify({"success": False, "message": "All fields are required"}), 400
    try:
        score = int(score)
        if score < 1 or score > 20:
            return jsonify({"success": False, "message": "Score must be between 1 and 10"}), 400
    except ValueError:
        return jsonify({"success": False, "message": "Score must be a valid number"}), 400

    connection = connecting()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO comment (userID, ISBN, message, score) VALUES (%s, %s, %s, %s)",
            (userID, ISBN, message, score)
        )
        connection.commit()
        return jsonify({"success": True})
    except Exception as e:
        connection.rollback()
        print(f"Error adding comment: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/check_overdue_books', methods=['GET'])
def check_overdue_books():
    userID = session.get('userID')
    if not userID:
        return jsonify({"success": False, "message": "User not logged in"}), 400

    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    try:
        seven_days_ago = datetime.now() - timedelta(days=7)
        cursor.execute("""
            SELECT borrow.ISBN, book.book_name
            FROM borrow
            JOIN book ON borrow.ISBN = book.ISBN
            WHERE borrow.userID = %s
            AND borrow.loan_date <= %s
            AND borrow.return_date IS NULL
        """, (userID, seven_days_ago))
        overdue_books = cursor.fetchall()
        return jsonify({"success": True, "overdue_books": overdue_books})
    except Exception as e:
        print(f"Error checking overdue books: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

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
    session['librarian_id'] = librarian_id
    print(f"Librarian ID stored in session: {librarian_id}")
    return render_template('librarian_home.html', first_name=first_name, last_name=last_name, librarian_id=librarian_id)

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
    cursor.execute("""
        SELECT borrow.*, usr.first_name, usr.last_name, book.book_name
        FROM borrow
        JOIN book ON borrow.ISBN = book.ISBN
        JOIN usr ON borrow.userID = usr.userID
    """)
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
        session['userID'] = users[0]['userID']
        return jsonify(
            {'redirect': url_for('user_home', first_name=users[0]['first_name'], last_name=users[0]['last_name'])})
    elif librarians:
        session['librarian_id'] = librarians[0]['librarianID']
        return jsonify({
            'redirect': url_for(
                'librarian_home',
                first_name=librarians[0]['first_name'],
                last_name=librarians[0]['last_name'],
                librarian_id=librarians[0]['librarianID']
            )
        })
    else:
        return jsonify({'error': 'Invalid ID'}), 401

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

@app.route('/get_user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT userID, first_name, last_name, city, street, age FROM usr WHERE userID = %s",
            (user_id,)
        )
        user = cursor.fetchone()
        if user:
            return jsonify({"success": True, "user": user})
        else:
            return jsonify({"success": False, "message": "User not found"}), 404
    except Exception as e:
        print(f"Error fetching user: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/edit_user', methods=['POST'])
def edit_user():
    userID = request.form.get('userID')
    firstName = request.form.get('firstName')
    lastName = request.form.get('lastName')
    city = request.form.get('city')
    street = request.form.get('street')
    age = request.form.get('age')
    librarianID = request.form.get('librarianID') or session.get('librarian_id')

    if not librarianID:
        return jsonify({"success": False, "message": "Librarian ID not found"}), 400

    connection = connecting()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            "UPDATE usr SET first_name = %s, last_name = %s, city = %s, street = %s, age = %s, librarianID = %s WHERE userID = %s",
            (firstName, lastName, city, street, age, librarianID, userID)
        )
        connection.commit()

        cursor.execute("SELECT first_name, last_name FROM librarian WHERE librarianID = %s", (librarianID,))
        librarian = cursor.fetchone()
        return jsonify({
            "success": True,
            "librarianFirstName": librarian['first_name'] if librarian else "",
            "librarianLastName": librarian['last_name'] if librarian else ""
        })
    except Exception as e:
        connection.rollback()
        print(f"Error updating user: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)