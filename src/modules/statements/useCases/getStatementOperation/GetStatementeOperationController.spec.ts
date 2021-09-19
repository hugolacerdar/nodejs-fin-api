import createConnection from "../../../../database";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import request from "supertest";
import { v4 as uuid4 } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;
let user_id: string;
let statement_op_id: string;
let rawPassword = "123456";
let token: string;

describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    user_id = uuid4();
    statement_op_id = uuid4();
    const hashPass = await hash(rawPassword, 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at) VALUES('${user_id}', 'Banana', 'banana@example.com', '${hashPass}', 'now()', 'now()') `
    );

    await connection.query(
      `INSERT INTO STATEMENTS(id, user_id, description, amount, type, created_at, updated_at) VALUES('${statement_op_id}','${user_id}', 'Banana', 100, 'deposit', 'now()', 'now()') `
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

  it("should get a statement operation matching the given id and the authenticated user", async () => {
    return await request(app)
      .get(`/api/v1/statements/${statement_op_id}`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send()
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body).toMatchObject({
          id: statement_op_id,
          user_id,
          amount: "100.00",
        });
      });
  });

  it("should return an error when the given id is invalid", async () => {
    return await request(app)
      .get(`/api/v1/statements/6c9992ab-83e9-4e7e-b943-3579ef4b93a2`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send()
      .then((response) => {
        expect(response.status).toEqual(404);
        expect(response.body).toMatchObject({
          message: "Statement not found",
        });
      });
  });

  it("should return an error when the given token is invalid", async () => {
    return await request(app)
      .get(`/api/v1/statements/6c9992ab-83e9-4e7e-b943-3579ef4b93a2`)
      .set({
        Authorization: `Bearer invalid_token`,
      })
      .send()
      .then((response) => {
        expect(response.status).toEqual(401);
        expect(response.body).toMatchObject({
          message: "JWT invalid token!",
        });
      });
  });
});
