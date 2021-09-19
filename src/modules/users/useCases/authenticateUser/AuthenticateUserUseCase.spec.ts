import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError"

import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let user: User;
let correctPassword: string;

describe("Authenticate User Use Case", () => {
    beforeAll(async () => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
        correctPassword = "123456"
        user = await createUserUseCase.execute({
            name: "Banana",
            email: "banana@example.com",
            password: correctPassword
        })
    })

    it("should authenticate an user if the given credentials are correct", async () => {
        const authReturn = await authenticateUserUseCase.execute({
            email: user.email,
            password: correctPassword
        })

        expect(authReturn).toMatchObject({ user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
        token: expect.anything()
        })
    }) 

    it("should throw an exception if any of the given credentials are incorrect", async () => {
        await expect(authenticateUserUseCase.execute({
            email: user.email,
            password: '654321'
        })).rejects.toEqual(new IncorrectEmailOrPasswordError())

        await expect(authenticateUserUseCase.execute({
            email: "apple@example.com",
            password: correctPassword
        })).rejects.toEqual(new IncorrectEmailOrPasswordError())

    }) 
})