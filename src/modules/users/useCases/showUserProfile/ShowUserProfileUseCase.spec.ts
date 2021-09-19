import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
let user: User;
let user_id: string; 

describe("Show User Profile Use Case", () => {
    beforeAll(async () => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
        user = await createUserUseCase.execute({
            name: "Banana",
            email: "banana@example.com",
            password: "123456"
        })

        user_id = user.id as string;
    })

     it("should return a user profile matching the given id when the user exists", async () => {
            const userProfile = await showUserProfileUseCase.execute(user_id);

            expect(userProfile).toMatchObject({
                id: user_id,
                name: user.name,
                email: user.email,
            })
        })

     it("should throw an exception when the user doesn't exists", async () => {
            await expect(showUserProfileUseCase.execute('non_existent_id')).rejects.toEqual(new ShowUserProfileError());
        })


})