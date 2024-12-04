const { app, db } = require("../app");
const request = require("supertest");

let server;

describe("Users API", () => {
  beforeAll(() => {
    server = app.listen(4000, () => console.log("Test server running on port 4000"));
  });
  
  afterAll((done) => {
    server.close((err) => {
      if (err) console.error("Error closing server:", err);
    db.close((err) => {
      if (err) console.error("Error closing database:", err);
      done();
    });
  })
});

  test("GET /users returns all users", async () => {
    const res = await request(app).get("/users");
    expect(res.statusCode).toBe(200);
    // expect(res.body).toEqual([{ id: 1, name: "John Doe", email: "john@example.com" }]);
  });

  test("POST /users creates a new user", async () => {
    const newUser = { name: "Jane Smith", email: "jane@example.com" };
    const res = await request(app).post("/users").send(newUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe(newUser.name);
    expect(res.body.email).toBe(newUser.email);
  });
  
  test("GET verify user Jane Smith exists with email jane@example.com", async() => {
      const getRes = await request(app).get("/users");
      expect(getRes.statusCode).toBe(200);
      expect(getRes.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Jane Smith", email: "jane@example.com" }),
        ])
      );
  })

  test("GET /users/:id returns a single user", async () => {
    const res = await request(app).get("/users/1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: 1, name: "John Doe", email: "john@example.com" });
  });

  test("GET /users/:id should return 404 if user does not exist", async () => {
    const res = await request(app).get("/users/9999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "User not found" });
  });
});

test("PUT /users/:id modify user id 1's email address", async () => {
  const resUser = await request(app).get("/users?email=john@example.com");
  
  const res = await request(app).put(`/users/${resUser.id}`).send({email:'johndoeEDIT@example.com'});
  expect(res.statusCode).toBe(204);
  expect(res.body).toEqual({ id:1, email:'johndoeEDIT@example.com' });
});

// test("DELETE /users/:id deletes the user and GET confirms it no longer exists", async () => {
//     const res = await request(app).get("/users?email=jane@example.com");
  
//     const deleteRes = await request(app).delete(`/users/${res.id}`);
//     expect(deleteRes.statusCode).toBe(204); // Expect 204 No Content after successful deletion
//     const getRes = await request(app).get("/users");
//     expect(getRes.statusCode).toBe(200);
//     expect(getRes.body).not.toContainEqual(expect.objectContaining({ id: userId, name: "Jane Smith", email: "jane@example.com" })); 
// })
