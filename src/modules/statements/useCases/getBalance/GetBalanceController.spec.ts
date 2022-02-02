import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "Get Balance Test",
      email: "getbalancetest@email.com",
      password: "123456",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance of user account", async () => {
    const responseSession = await request(app).post("/api/v1/sessions").send({
      email: "getbalancetest@email.com",
      password: "123456",
    });

    const { token } = responseSession.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("balance");
  });

  it("should not be able to get balance if user is not authenticated", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .send();

    expect(response.status).toBe(401);
  });
});
