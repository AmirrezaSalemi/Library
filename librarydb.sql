SELECT book.* , author.first_name, author.last_name
FROM book, authorbook, author
WHERE book.ISBN = authorbook.ISBN
AND authorbook.authorID = author.authorID
