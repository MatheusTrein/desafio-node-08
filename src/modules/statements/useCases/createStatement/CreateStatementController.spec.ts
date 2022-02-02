import request from "supertest";
import createConnection from "../../../../database";
import { app } from "../../../../app";
import { Connection } from "typeorm";

let connection: Connection;

describe("Create Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "Create Statement Test",
      email: "createstatementtest@email.com",
      password: "123456",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a deposit statement", async () => {
    const responseSession = await request(app).post("/api/v1/sessions").send({
      email: "createstatementtest@email.com",
      password: "123456",
    });

    const { token } = responseSession.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 50,
        description: "deposit of 50",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should be able a create withdraw statement if user have sufficient founds", async () => {
    const responseSession = await request(app).post("/api/v1/sessions").send({
      email: "createstatementtest@email.com",
      password: "123456",
    });

    const { token } = responseSession.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 25,
        description: "withdraw of 25",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a deposit statement if user does not authenticate", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 50,
        description: "deposit of 50",
      });

    expect(response.status).toBe(401);
  });

  it("should not be able to create a withdraw statement if user balance is less then amount", async () => {
    const responseSession = await request(app).post("/api/v1/sessions").send({
      email: "createstatementtest@email.com",
      password: "123456",
    });

    const { token } = responseSession.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 1000,
        description: "whitdraw of 1000",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
