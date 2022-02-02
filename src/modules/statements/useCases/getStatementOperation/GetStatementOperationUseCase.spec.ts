import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

interface IIdUser {
  id: string;
}

interface IIdStatement {
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
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get the statement operation", async () => {
    const { id: user_id } = (await createUserUseCase.execute({
      name: "Get Statement Test",
      email: "getstatementteste@email.com",
      password: "123456",
    })) as IIdUser;

    const { id: statement_id } = (await createStatementUseCase.execute({
      user_id,
      amount: 50,
      description: "deposit of 50",
      type: OperationType.DEPOSIT,
    })) as IIdStatement;

    const statement = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });

    expect(statement).toHaveProperty("id");
    expect(statement.amount).toBe(50);
  });

  it("should not be able to get a statement if user not exists", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "invalidId",
        statement_id: "invalidId",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get a statement if statement not exists", () => {
    expect(async () => {
      const { id: user_id } = (await createUserUseCase.execute({
        name: "Get Unexisting Statement Test",
        email: "getunexistingstatementtest@email.com",
        password: "123456",
      })) as IIdUser;

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id: "invalidId",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
