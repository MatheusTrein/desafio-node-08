import request from "supertest";
import createConnection from "../../../../database";
import { app } from "../../../../app";
import { Connection } from "typeorm";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create session", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Authenticate User Test",
      email: "authenticateusertest@email.com",
      password: "123456",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "authenticateusertest@email.com",
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to create a session if user not exists", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "emailunregistered@email.com",
      password: "123456",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to create a session if password is incorrect", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Password Incorret Test",
      email: "passwordincorrecttest@email.com",
      password: "123456",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "passwordincorrecttest@email.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
  });
});
