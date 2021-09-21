import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { TransferOperationType } from "./CreateTransferController";
import { CreateTransferError } from "./CreateTransferError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StatementsRepository")
    private statementRepository: IStatementsRepository
  ) {}

  async execute({
    sender_id,
    receiver_id,
    amount,
    description,
  }: ICreateTransferDTO) {
    sender_id = sender_id as string;
    receiver_id = receiver_id as string;

    const sender = await this.usersRepository.findById(sender_id);

    if (!sender) throw new CreateTransferError.SenderNotFound();

    const receiver = await this.usersRepository.findById(receiver_id);

    if (!receiver) throw new CreateTransferError.ReceiverNotFound();

    const { balance } = await this.statementRepository.getUserBalance({
      user_id: sender_id,
      with_statement: false,
    });

    const numBalance = Number(balance);

    if (amount > numBalance) throw new CreateTransferError.InsufficientFunds();

    const senderTransfer = await this.statementRepository.transfer({
      sender_id,
      receiver_id,
      amount,
      description,
    });

    return senderTransfer;
  }
}

export { CreateTransferUseCase };
