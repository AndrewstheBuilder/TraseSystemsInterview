const { app, db } = require("../app");
const request = require("supertest");
const ERROR_MESSAGE = require("../constants");

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
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "John Doe", email: "john@example.com" }),
      ])
    );
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
    // do not expect id of Jane Smith to be 2 for future proofing!
    expect(getRes.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Jane Smith", email: "jane@example.com" }),
      ])
    );
  })

  test("GET /users/:id returns a single user", async () => {
    const res = await request(app).get("/users/1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({name: "John Doe", email: "john@example.com" })
    );
  });

  test("GET /users/:id should return 404 if user does not exist", async () => {
      const res = await request(app).get("/users/9999");
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: ERROR_MESSAGE.USER_NOT_FOUND });
    });
    
  test("GET /users?email=jane@example.com should return 200 for query param email", async () => {
    const res = await request(app).get("/users?email=jane@example.com");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: "jane@example.com",
          name: "Jane Smith"
        })
      ])
    );
  });
  
  test("PUT /users/:id modify jane@example.com email address", async () => {
    const resUser = await request(app).get("/users?email=jane@example.com");
    expect(resUser.statusCode).toBe(200);
    expect(resUser.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: "jane@example.com",
          name: "Jane Smith"
        })
      ])
    );
    const resUserActual = resUser.body[0];
    
    const res = await request(app).put(`/users/${resUserActual.id}`).send({email:'janeEDIT@example.com'});
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({id: resUserActual.id, name: "Jane Smith", email: "janeEDIT@example.com" });
  });
  
  test("PUT /users/:id return 404 for user that does not exist", async () => {
    const res = await request(app).put(`/users/9999`).send({email:'janeEDIT@example.com'});
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({error:ERROR_MESSAGE.USER_NOT_FOUND});
  });
  
  test("DELETE /users/:id deletes the user and GET confirms it no longer exists", async () => {
    // emails are unique so I know I will get the unique user I expect
    const resUser = await request(app).get("/users?email=janeEDIT@example.com");
    expect(resUser.statusCode).toBe(200);
    expect(resUser.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: "janeEDIT@example.com",
          name: "Jane Smith"
        })
      ])
    );
    const resUserActual = resUser.body[0];
    
    const deleteRes = await request(app).delete(`/users/${resUserActual.id}`);
    expect(deleteRes.statusCode).toBe(204);
    const getRes = await request(app).get("/users");
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body).not.toContainEqual(expect.objectContaining({ id: resUserActual.id, name: "Jane Smith", email: "janeEDIT@example.com" })); 
  })
  
  
  test("DELETE /users/:id attempt to delete user that does not exist get 404", async () => {
    const deleteRes = await request(app).delete(`/users/9999`);
    expect(deleteRes.statusCode).toBe(404);
    expect(deleteRes.body).toEqual({error:ERROR_MESSAGE.USER_NOT_FOUND});
  })
});
