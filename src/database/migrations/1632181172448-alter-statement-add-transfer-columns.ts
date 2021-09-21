import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterStatementAddTransferColumns1632181172448
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "statements",
      "type",
      new TableColumn({
        name: "type",
        type: "enum",
        enum: ["deposit", "withdraw", "transfer"],
      })
    );

    await queryRunner.addColumn(
      "statements",
      new TableColumn({
        name: "sender_id",
        type: "varchar",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "statements",
      new TableColumn({
        name: "receiver_id",
        type: "varchar",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "statements",
      "type",
      new TableColumn({
        name: "type",
        type: "enum",
        enum: ["deposit", "withdraw"],
      })
    );

    await queryRunner.dropColumn("statements", "sender_id");

    await queryRunner.dropColumn("statements", "receiver_id");
  }
}
