import { CreateUserUseCase } from "./CreateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able a create new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Matheus Trein",
      email: "matheusptrein@hotmail.com",
      password: "123456",
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be able to create an user if email already exists", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Username",
        email: "user@email.com",
        password: "123456",
      });

      await createUserUseCase.execute({
        name: "Username2",
        email: "user@email.com",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
