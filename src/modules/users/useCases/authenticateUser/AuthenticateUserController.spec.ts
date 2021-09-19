import createConnection from "../../../../database";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import request from "supertest";
import { v4 as uuid4 } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;
let user_id: string;
let rawPassword = "123456";

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    user_id = uuid4();
    const hashPass = await hash(rawPassword, 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at) VALUES('${user_id}', 'Banana', 'bananinha@example.com', '${hashPass}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase().then(() => connection.close());
  });

  it("should authenticate a user when email and password matches an existing user", async () => {
    return await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "bananinha@example.com",
        password: rawPassword,
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty("token");
      });
  });

  it("should not authenticate a user when email or password doesn't matches an existing user", async () => {
    await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "bananinha@example.com",
        password: "wrong_password",
      })
      .then((response) => {
        expect(response.status).toEqual(401);
        expect(response.body.message).toEqual("Incorrect email or password");
      });

    await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "wrong_email@example.com",
        password: rawPassword,
      })
      .then((response) => {
        expect(response.status).toEqual(401);
        expect(response.body.message).toEqual("Incorrect email or password");
      });
  });
});
