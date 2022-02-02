import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

interface ShowUserProfileId {
  id: string;
}

let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show user profile", async () => {
    const { id } = (await createUserUseCase.execute({
      name: "Show User Profile Test",
      email: "showuserprofiletest@email.com",
      password: "123456",
    })) as ShowUserProfileId;

    const showUserProfile = await showUserProfileUseCase.execute(id);

    expect(showUserProfile).toBe(showUserProfile);
  });

  it("should be not able to show user profile if user not exists", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("InvalidId");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
