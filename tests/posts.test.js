const { app, db } = require("../app");
const request = require("supertest");
const ERROR_MESSAGE = require("../constants");

describe("Posts API", () => {
    test("POST /users create a post with invalid user returns 400", async () => {
        const newPost = { title: "Unknown Post", content: "whatever", user_id:'9999' };
        const res = await request(app).post("/posts").send(newPost);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: ERROR_MESSAGE.USER_NOT_FOUND });
    });
})