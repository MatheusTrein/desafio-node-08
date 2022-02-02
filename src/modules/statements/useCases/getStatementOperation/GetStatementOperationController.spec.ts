import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "Get Statement Operation Test",
      email: "getstatementoperationteste@email.com",
      password: "123456",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a statement operation", async () => {
    const responseSession = await request(app).post("/api/v1/sessions").send({
      email: "getstatementoperationteste@email.com",
      password: "123456",
    });

    const { token } = responseSession.body;

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 50,
        description: "deposit of 50",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id: statement_id } = responseStatement.body;

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to get statement if user is not authenticated", async () => {
    const responseSession = await request(app).post("/api/v1/sessions").send({
      email: "getstatementoperationteste@email.com",
      password: "123456",
    });

    const { token } = responseSession.body;

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 50,
        description: "deposit of 50",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id: statement_id } = responseStatement.body;

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .send();

    expect(response.status).toBe(401);
  });

  it("should not be able to get a statement if statement not exists", async () => {
    const responseSession = await request(app).post("/api/v1/sessions").send({
      email: "getstatementoperationteste@email.com",
      password: "123456",
    });

    const { token } = responseSession.body;

    const response = await request(app)
      .get("/api/v1/statements/c6befe04-844b-11ec-a8a3-0242ac120002")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
