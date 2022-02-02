import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to authenticate user", async () => {
    await createUserUseCase.execute({
      name: "authentication test",
      email: "authentication@email.com",
      password: "123456",
    });

    const authenticateUser = await authenticateUserUseCase.execute({
      email: "authentication@email.com",
      password: "123456",
    });

    expect(authenticateUser).toHaveProperty("token");
  });

  it("should not be able to authenticate user if user not exists", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "undefineduser@email.com",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should be able to authenticate user if password is incorrect", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User Test",
        email: "wrongpassword@email.com",
        password: "123456",
      });

      await authenticateUserUseCase.execute({
        email: "wrongpassword@email.com",
        password: "wrongpassword",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
