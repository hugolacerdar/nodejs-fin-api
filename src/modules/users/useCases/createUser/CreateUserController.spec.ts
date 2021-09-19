import createConnection from "../../../../database";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import request from "supertest";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase().then(() => connection.close());
  });

  it("should be able to create an user", async () => {
    return await request(app)
      .post("/api/v1/users")
      .send({
        name: "Banana",
        email: "bananinha@example.com",
        password: "123456",
      })
      .then((response) => {
        expect(response.status).toEqual(201);
      });
  });

  it("should return an error if the email is already in use", async () => {
    const email = "bananinha@example.com";

    await request(app).post("/api/v1/users").send({
      name: "Banana",
      email: email,
      password: "123456",
    });

    return await request(app)
      .post("/api/v1/users")
      .send({
        name: "Banana",
        email: email,
        password: "123456",
      })
      .then((response) => {
        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual("User already exists");
      });
  });
});
