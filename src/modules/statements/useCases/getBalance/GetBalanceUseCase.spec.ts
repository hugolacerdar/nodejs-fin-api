import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { User } from "../../../users/entities/User";
import { OperationType, Statement } from '../../entities/Statement'
import { GetBalanceError } from "./GetBalanceError";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let user: User;
let user_id: string;
let statement: Statement;
let statement_id: string;


describe("Get Statement Operation Use Case", () => {
    beforeAll(async () => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);      
        getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);      
        user = await createUserUseCase.execute({
            name: "Banana",
            email: "banana@example.com",
            password: "123456"
        })

        user_id = user.id as string;    

        await createStatementUseCase.execute({
            user_id, 
            type: OperationType.DEPOSIT, 
            amount: 1000, 
            description: "Banana"});
        await createStatementUseCase.execute({
            user_id, 
            type: OperationType.WITHDRAW, 
            amount: 500, 
            description: "Banana"});
    })

    it("should get the complete statement and balance matching the given user id when it exists", async () => {
        const returnedStatement = await getBalanceUseCase.execute({user_id});

        expect(returnedStatement).toMatchObject({
            statement: [{
            id: expect.anything(),
            user_id: user_id,
            type: 'deposit',
            amount: 1000,
            description: 'Banana'
          },
          {
            id: expect.anything(),
            user_id: user_id,
            type: 'withdraw',
            amount: 500,
            description: 'Banana'
          }],
          balance: 500
        })
    })

    it("should throw an error when the given user id doesn't matches any user", async () => {
        await expect(getBalanceUseCase.execute({user_id: "non_existent_id"})).rejects.toEqual(new GetBalanceError())
    })
})