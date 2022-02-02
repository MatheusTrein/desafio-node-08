import request from "supertest";
import createConnection from "../../../../database";
import { app } from "../../../../app";
import { Connection } from "typeorm";

let connection: Connection;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "Show User Profile Test",
      email: "showuserprofiletest@email.com",
      password: "123456",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show user profile", async () => {
    const responseSession = await request(app).post("/api/v1/sessions").send({
      email: "showuserprofiletest@email.com",
      password: "123456",
    });

    const { token } = responseSession.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to show user profile if user is not authenticated", async () => {
    const response = await request(app).get("/api/v1/profile").send();

    expect(response.status).toBe(401);
  });
});
