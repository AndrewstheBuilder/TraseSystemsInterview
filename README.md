# TraseSystemsInterview API Overview
## To Run Application
- `npm install`
- `npm start`
### To Run Unit and Integration Tests
- *After running npm install once above*
- `npm test`
### To Test Application Manually
- Use Postman or a similar application
- Hit the endpoints at port `3000` like `http://localhost:3000/posts` or `http://localhost:3000/users`
## API Details
### Endpoints and How to Call them
#### GET `http://localhost:3000/users`. 
  - Get an array of all users.
  - Sample Output:
``` json
[
    {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
    }
]
```
#### GET `http://localhost:3000/users?name=John`. 
  - Get a filtered array of filtered users. Filter on name or email and it will return values that are similar to input
  - Sample Output:
``` json
[
    {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
    }
]
```
#### POST `http://localhost:3000/users`
  - Create a user with name and email. Name cannot be null and email has to be unique
  - Sample Input:
```json
{
    "name": "Jane123 Smith",
    "email": "jane123@example.com"
}
```
- Sample Output:
``` json
{
    "id": 2,
    "name": "Jane123 Smith",
    "email": "jane123@example.com"
}
```
#### PUT `http://localhost:3000/users/:user_id`
  - Update name or email by user id
  - Sample Input -> Give property name of `email` or `name` to change 
  - Sample Input
```json
{
    "email":"johndoeEDIT@example.com"
}
```
  - Sample Output
```json
{
    "id": 1,
    "name": "John Doe",
    "email": "johndoeEDIT@example.com"
}
```
#### DELETE `http://localhost:3000/users/:user_id`
  - Delete user by user id
#### GET `http://localhost:3000/posts`
  - Get all posts
  - Output Example:
```json
[
    {
        "id": 1,
        "title": "First Post",
        "content": "Hello World!",
        "user_id": 1
    }
]
```
#### POST `http://localhost:3000/posts`
  - Create new post
  - Input Example *Pass in valid user_id*:
```json
{
    "title": "Test Post 1",
    "content": "This is a test post 1.",
    "user_id": 1
}
```
  - Output Example:
```json
{
    "id": 2,
    "title": "Test Post 1",
    "content": "This is a test post 1.",
    "user_id": 1
}
```

#### PUT `http://localhost:3000/posts/:post_id`
  - Modify existing post. Must have post_id and valid user_id that is connected to that post
  - Input Example:
```json
{
    "title": "EDIT",
    "user_id": 1
}
```
  - Output Example:
```json
{
    "id": 1,
    "title": "EDIT",
    "content": "Hello World!",
    "user_id": 1
}
```
#### DELETE `http://localhost:3000/posts/:post_id`
  - Delete post by id
#### Possible Request Codes and Messages
- GET
  - with filtering
    - `404` User Not Found or Post Not Found
  - `200` GET worked
- POST
  - `500` server error if all inputs are not passed in.
    - `name` and `email` cannot be null in `/users`
    - `title`, `content`, and `user_id` cannot be null in `/posts`
  -  `201` POST success
- PUT
    - `404` user not found or post not found
    - `200` with USER entity that was updated output or POST entity that was updated
- DELETE
  - `404` user not found or post not found.
  - `204` delete is successful
### Tables:
#### User Table
``` sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
)
```
#### Posts Table
``` sql
    CREATE TABLE posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
      CONSTRAINT unique_title_user_id UNIQUE (title, user_id)
    )
```
### Assumptions
- USER and POST can only be created with all fields of USER and POST entity being NOT NULL
- In USER
  - assumed email addresses need to be unique
- IN POSTS
  - assumed user_id and title to be unique. So a user does not create the same posts over and over again.
- For PUT method we can update just one field instead of having to update every possible field as specified in the instructions of this assignment. So if end user just wants to update the USER email and leave the name without passing the name in the PUT input that is possible.
### Limitations/Possible TODOs
- When a user with posts are deleted we delete the associated user posts first so as to avoid a foreign key violation between USERS and POSTS table.
  - Maybe soft delete users and posts so to retain post and user information in the system.
- Server errors for NOT NULL and UNIQUE constraints violations should be handled by server to return a better error message
    - Input validation is needed in the server to avoid database constraint violations
- Putting sensitive information in requests like user_id is not recommended. Adding authentication would be good. 
