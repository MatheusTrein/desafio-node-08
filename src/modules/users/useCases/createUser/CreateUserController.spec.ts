import request from "supertest";
import createConnection from "../../../../database";
import { app } from "../../../../app";
import { Connection } from "typeorm";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able a create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User Create Test",
      email: "user@email.com",
      password: "123456",
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new user if email already exists", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User Exists Test",
      email: "user@email.com",
      password: "123456",
    });

    expect(response.status).toBe(400);
  });
});
