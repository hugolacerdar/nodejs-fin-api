import createConnection from "../../../../database";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import request from "supertest";
import { v4 as uuid4 } from "uuid";
import { hash } from "bcryptjs";
import { User } from "../../entities/User";
import { JWTInvalidTokenError } from "../../../../shared/errors/JWTInvalidTokenError";

let connection: Connection;
let user_id: string;
let rawPassword = "123456";
let token: string;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    user_id = uuid4();
    const hashPass = await hash(rawPassword, 8);
    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at) VALUES('${user_id}', 'Banana', 'banana@example.com', '${hashPass}', 'now()', 'now()') `
    );

    const authResponse = await request(app).post("/api/v1/sessions").send({
      email: "banana@example.com",
      password: rawPassword,
    });

    token = authResponse.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase().then(() => connection.close());
  });

  it("should get the authenticated user profile when the JWT is valid", async () => {
    return await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send()
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.id).toEqual(user_id);
      });
  });

  it("should return with an error when the token is invalid", async () => {
    return await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer invalid_token`,
      })
      .send()
      .then((response) => {
        expect(response.status).toEqual(401);
        expect(response.body.message).toEqual("JWT invalid token!");
      });
  });
});
