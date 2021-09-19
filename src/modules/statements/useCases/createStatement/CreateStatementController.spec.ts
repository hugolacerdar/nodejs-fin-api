import createConnection from "../../../../database";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import request from "supertest";
import { v4 as uuid4 } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;
let user_id: string;
let rawPassword = "123456";
let token: string;

describe("Create Statement Controller", () => {
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

  afterEach(async () => {
    await connection.query("DELETE FROM statements;");
  });

  afterAll(async () => {
    await connection.dropDatabase().then(() => connection.close());
  });

  it("should perform and return a statement operation of type deposit", async () => {
    return await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 230,
        description: "Banana",
      })
      .set({
        Authorization: `Bearer ${token}`,
      })
      .then((response) => {
        expect(response.status).toEqual(201);
        expect(response.body).toMatchObject({
          user_id,
          amount: 230,
          type: "deposit",
        });
      });
  });

  it("should perform and return a statement operation of type withdraw when there are enough funds", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 230,
        description: "Banana",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    return await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 130,
        description: "Banana",
      })
      .set({
        Authorization: `Bearer ${token}`,
      })
      .then((response) => {
        expect(response.status).toEqual(201);
        expect(response.body).toMatchObject({
          user_id,
          amount: 130,
          type: "withdraw",
        });
      });
  });

  it("should return an error when attempting to withdraw without enough funds", async () => {
    return await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 230,
        description: "Banana",
      })
      .set({
        Authorization: `Bearer ${token}`,
      })
      .then((response) => {
        expect(response.status).toEqual(400);
        expect(response.body).toEqual({
          message: "Insufficient funds",
        });
      });
  });
});
