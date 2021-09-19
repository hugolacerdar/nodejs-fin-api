import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";


let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User Use Case", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    })

    it("should be able to create an user", async () => {
        const data = {
            name: "Banana",
            email: "bananinha@example.com",
            password: "123456"
        }
        const user = await createUserUseCase.execute(data);

        expect(user).toMatchObject({
            name: data.name,
            email: data.email
        });
        expect(user).toHaveProperty('id');
    })

    it("should throw an error if the email is already in use", async () => {
        const dataA = {
            name: "Banana",
            email: "bananinha@example.com",
            password: "123456"
        }
        const dataB = {
            name: "Maçã",
            email: "bananinha@example.com",
            password: "123456"
        }
        await createUserUseCase.execute(dataA);
        await expect(
             createUserUseCase.execute(dataB)
        ).rejects.toEqual(new CreateUserError())
    })

    it("should encrypt the password on user creation", async () => {
        const data = {
            name: "Banana",
            email: "bananinha@example.com",
            password: "123456"
        }

        const user = await createUserUseCase.execute(data);

        expect(user.password).not.toEqual(data.password)
    })
})