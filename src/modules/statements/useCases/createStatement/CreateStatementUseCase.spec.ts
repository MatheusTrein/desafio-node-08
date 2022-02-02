import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { create } from "domain";

interface IIdUser {
  id: string;
}

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able a create a new statement", async () => {
    const { id } = (await createUserUseCase.execute({
      name: "Create Statament Test",
      email: "createstatementtest@email.com",
      password: "123456",
    })) as IIdUser;

    const statement = await createStatementUseCase.execute({
      user_id: id,
      amount: 50,
      description: "deposit of 50",
      type: OperationType.DEPOSIT,
    });

    expect(statement).toHaveProperty("id");
  });

  it("should not be able to create a new statement if user not exists", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "invalidId",
        amount: 50,
        description: "deposit of 50",
        type: OperationType.DEPOSIT,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a new withdraw statement if balance is lass then amount", () => {
    expect(async () => {
      const { id } = (await createUserUseCase.execute({
        name: "Withdraw Statement Test",
        email: "withdrawstatementtest@email.com",
        password: "123456",
      })) as IIdUser;

      await createStatementUseCase.execute({
        user_id: id,
        amount: 30,
        description: "deposit of 30",
        type: OperationType.DEPOSIT,
      });

      await createStatementUseCase.execute({
        user_id: id,
        amount: 50,
        description: "withdraw of 50",
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
