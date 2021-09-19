import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { User } from "../../../users/entities/User";
import { OperationType } from '../../entities/Statement'
import { CreateStatementError } from "./CreateStatementError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let user: User;
let user_id: string;
let depositAmount: number;
let withdrawAmount: number;
let noFundsAmount: number;

describe("Create Statement Use Case", () => {
    beforeAll(async () => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);      
        depositAmount = 1000;
        withdrawAmount = depositAmount/2;
        noFundsAmount = depositAmount * 2;
        user = await createUserUseCase.execute({
            name: "Banana",
            email: "banana@example.com",
            password: "123456"
        })

        user_id = user.id as string;    
    })

    it("should create the statement when the user deposits money", async () => {
        const statementData = await createStatementUseCase.execute({user_id, type: OperationType.DEPOSIT, amount: depositAmount, description: "Bananas"});

        expect(statementData).toHaveProperty('id');
        expect(statementData).toMatchObject({
            user_id: user_id,
            type: 'deposit',
            amount: depositAmount,
            description: 'Bananas'
        })
    })

    it("should create the statement when the user withdraws money having enough funds", async () => {
        const statementData = await createStatementUseCase.execute({user_id, type: OperationType.WITHDRAW, amount: withdrawAmount, description: "Bananas"});

        expect(statementData).toHaveProperty('id');
        expect(statementData).toMatchObject({
            user_id: user_id,
            type: 'withdraw',
            amount: withdrawAmount,
            description: 'Bananas'
        })
    })

    it("should throw an error when the user tries to withdraw money not having enough funds", async () => {
        await expect(createStatementUseCase.execute({user_id, type: OperationType.WITHDRAW, amount: noFundsAmount, description: "Bananas"})).rejects.toEqual(new CreateStatementError.InsufficientFunds())
    })

    it("should throw an error when the given user id doesn't matches any user", async () => {
        await expect(createStatementUseCase.execute({user_id: "non_existent_id", type: OperationType.DEPOSIT, amount: depositAmount, description: "Bananas"})).rejects.toEqual(new CreateStatementError.UserNotFound())
    })
})