const { app, db } = require("../app");
const request = require("supertest");

describe("Integration Tests", () => {
  test("Create a user, create a post, and fetch the post", async () => {
    // Create a user
    const newUser = {
      name: "Test User",
      email: "test@example.com",
    }
    const userRes = await request(app).post("/users").send(newUser);
    expect(userRes.statusCode).toBe(201);
    expect(userRes.body).toHaveProperty("id");
    expect(userRes.body.name).toBe(newUser.name);
    expect(userRes.body.email).toBe(newUser.email);

    // Create a post
    const postRes = await request(app).post("/posts").send({
      title: "Test Post",
      content: "This is a test post.",
      user_id: userRes.body.id,
    });
    expect(postRes.statusCode).toBe(201);

    // Get the post
    const getPostRes = await request(app).get(`/posts/${postRes.body.id}`);
    expect(getPostRes.statusCode).toBe(200);
    expect(getPostRes.body).toEqual({
      id: postRes.body.id,
      title: "Test Post",
      content: "This is a test post.",
      user_id: userRes.body.id,
    });
  });
  
  test("Create a user, create a post, fetch the post, update the post, delete the post, fetch all posts", async () => {
    // Create a user
    const newUser = {
      name: "Test User 2",
      email: "test2@example.com",
    }
    const userRes = await request(app).post("/users").send(newUser);
    expect(userRes.statusCode).toBe(201);
    expect(userRes.body).toHaveProperty("id");
    expect(userRes.body.name).toBe(newUser.name);
    expect(userRes.body.email).toBe(newUser.email);

    // Create a post
    const postRes = await request(app).post("/posts").send({
      title: "Test Post 2",
      content: "This is a test post 2.",
      user_id: userRes.body.id,
    });
    expect(postRes.statusCode).toBe(201);

    // Get the post
    const getPostRes = await request(app).get(`/posts/${postRes.body.id}`);
    expect(getPostRes.statusCode).toBe(200);
    expect(getPostRes.body).toEqual({
      id: postRes.body.id,
      title: "Test Post 2",
      content: "This is a test post 2.",
      user_id: userRes.body.id,
    });
    
    // update a post's title and content
    const updateRes = await request(app)
      .put(`/posts/${postRes.body.id}`)
      .send({ user_id: userRes.body.id, title: "Andrews Edit", content: "Andrews Edit" })
    expect(updateRes.body).toEqual({
      id: postRes.body.id, user_id: userRes.body.id,
      title: "Andrews Edit", content: "Andrews Edit"
    });

    // Delete a post
    const deleteRes = await request(app).delete(`/posts/${postRes.body.id}`);
    expect(deleteRes.statusCode).toBe(204);
    
    // Get all posts deleted post should not be there
    const getAllPosts = await request(app).get(`/posts`)
    expect(getAllPosts.body).not.toContainEqual(expect.objectContaining({ id: postRes.body.id })); 

  });
});
