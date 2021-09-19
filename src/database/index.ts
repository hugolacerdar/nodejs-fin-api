import { Connection, createConnection, getConnectionOptions } from "typeorm";
import { AuroraDataApiConnectionOptions } from "typeorm/driver/aurora-data-api/AuroraDataApiConnectionOptions";

interface IOptions {
  host: string;
  database: string;
}

export default async (host = "database"): Promise<Connection> => {
  const options = await getConnectionOptions();
  const newOptions = options as IOptions;
  newOptions.host = process.env.NODE_ENV === "test" ? "localhost" : host;

  return createConnection(
    Object.assign(newOptions, {
      database:
        process.env.NODE_ENV === "test" ? "fin_api_test" : newOptions.database,
    }) as AuroraDataApiConnectionOptions
  );
};
