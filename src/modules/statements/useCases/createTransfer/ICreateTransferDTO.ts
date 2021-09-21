import { Statement } from "../../entities/Statement";

export interface ICreateTransferDTO {
  sender_id: string;
  receiver_id: string;
  amount: number;
  description: string;
}
