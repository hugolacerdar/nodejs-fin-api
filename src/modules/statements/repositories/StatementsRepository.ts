import { getRepository, Repository } from "typeorm";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { TransferOperationType } from "../useCases/createTransfer/CreateTransferController";
import { ICreateTransferDTO } from "../useCases/createTransfer/ICreateTransferDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    amount,
    description,
    type,
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create({
      user_id,
      amount,
      description,
      type,
    });

    return this.repository.save(statement);
  }

  async findStatementOperation({
    statement_id,
    user_id,
  }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id },
    });
  }

  async getUserBalance({
    user_id,
    with_statement = false,
  }: IGetBalanceDTO): Promise<
    { balance: number } | { balance: number; statement: any[] }
  > {
    const statement = await this.repository.find({
      where: { user_id },
    });

    const balance = statement.reduce((acc, operation) => {
      const tally = parseFloat(String(operation.amount));

      if (operation.type === "deposit" || operation.sender_id) {
        return acc + tally;
      } else {
        return acc - tally;
      }
    }, 0);

    if (with_statement) {
      return {
        statement,
        balance,
      };
    }

    return { balance };
  }

  async transfer({
    sender_id,
    receiver_id,
    amount,
    description,
  }: ICreateTransferDTO): Promise<Statement> {
    const senderTransfer = this.repository.create({
      user_id: sender_id,
      receiver_id,
      amount,
      description,
      type: TransferOperationType.TRANSFER,
    });

    const receiverTransfer = this.repository.create({
      user_id: receiver_id,
      sender_id,
      amount,
      description,
      type: TransferOperationType.TRANSFER,
    });

    await this.repository.save(senderTransfer);
    await this.repository.save(receiverTransfer);
    return senderTransfer;
  }
}
