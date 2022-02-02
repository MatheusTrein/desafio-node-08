import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

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
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance of Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get balance", async () => {
    const { id } = (await createUserUseCase.execute({
      name: "Get Balance Test",
      email: "getbalancetest@email.com",
      password: "123456",
    })) as IIdUser;

    await createStatementUseCase.execute({
      user_id: id,
      amount: 50,
      description: "deposit of 50",
      type: OperationType.DEPOSIT,
    });

    const balance = await getBalanceUseCase.execute({ user_id: id });

    expect(balance.balance).toBe(50);
    expect(balance).toHaveProperty("statement");
    expect(balance.statement.length).toBe(1);
  });

  it("should not be able a get balance if user is not exists", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "invalidId" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
