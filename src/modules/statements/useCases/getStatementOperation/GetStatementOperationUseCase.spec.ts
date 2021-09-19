import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { User } from "../../../users/entities/User";
import { OperationType, Statement } from '../../entities/Statement'
import { GetStatementOperationError } from "./GetStatementOperationError";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
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
        getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);      
        user = await createUserUseCase.execute({
            name: "Banana",
            email: "banana@example.com",
            password: "123456"
        })

        user_id = user.id as string;    

        statement = await createStatementUseCase.execute({
            user_id, 
            type: OperationType.DEPOSIT, 
            amount: 1000, 
            description: "Banana"});

            statement_id = statement.id as string;    
    })

    it("should get the operation statement matching the given id when it exists and is related to the given user id", async () => {
        const returnedStatement = await getStatementOperationUseCase.execute({user_id, statement_id});

        expect(returnedStatement).toMatchObject({
            id: statement_id,
            user_id: user_id,
            type: 'deposit',
            amount: 1000,
            description: 'Banana'
          })
    })

    it("should throw an error when the given user id doesn't matches any user", async () => {
        await expect(getStatementOperationUseCase.execute({user_id: "non_existent_id", statement_id})).rejects.toEqual(new GetStatementOperationError.UserNotFound())
    })

    it("should throw an error when the given statement id doesn't matches any of the user's statements", async () => {
        await expect(getStatementOperationUseCase.execute({user_id, statement_id: "non_existent_id"})).rejects.toEqual(new GetStatementOperationError.StatementNotFound())
    })
})