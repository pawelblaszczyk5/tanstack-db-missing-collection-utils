import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
import {
  localStorageCollectionOptions,
  createCollection,
} from "@tanstack/react-db";
import { Schema } from "effect";
import {
  PowerSyncDatabase,
  Schema as PowerSyncSchema,
  Table,
  column,
} from "@powersync/node";
import { initClient } from "trailbase";
import { trailBaseCollectionOptions } from "@tanstack/trailbase-db-collection";
import { QueryClient } from "@tanstack/query-core";
import { queryCollectionOptions } from "@tanstack/query-db-collection";

const schema = Schema.Struct({ id: Schema.String }).pipe(
  Schema.standardSchemaV1,
);

const localStorageCollection = createCollection(
  localStorageCollectionOptions({
    storageKey: "example",
    schema,
    getKey: (item) => item.id,
  }),
);

const localStorageUtils = localStorageCollection.utils;

const electricCollection = createCollection(
  electricCollectionOptions({
    shapeOptions: {
      url: "/test",
    },
    schema,
    getKey: (item) => item.id,
  }),
);

const electricUtils = electricCollection.utils;

const APP_SCHEMA = new PowerSyncSchema({
  users: new Table({
    name: column.text,
    active: column.integer, // Will be mapped to Boolean
  }),
  documents: new Table(
    {
      name: column.text,
      author: column.text,
      created_at: column.text, // Will be mapped to Date
    },
    {
      trackMetadata: true,
    },
  ),
});

const db = new PowerSyncDatabase({
  schema: APP_SCHEMA,
  database: {
    dbFilename: "test.db",
  },
});

const powerSyncCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: APP_SCHEMA.props.documents,
  }),
);

const powerSyncUtils = powerSyncCollection.utils;

const trailBaseClient = initClient(`https://your-trailbase-instance.com`);

const trailbaseCollection = createCollection(
  trailBaseCollectionOptions({
    id: "todos",
    recordApi: trailBaseClient.records("todos"),
    getKey: (item) => item.id as string,
    parse: {},
    serialize: {},
  }),
);

const trailbaseUtils = trailbaseCollection.utils;

const queryClient = new QueryClient();

const queryCollection = createCollection(
  queryCollectionOptions({
    queryKey: ["todos"],
    queryFn: async () => {
      const response = await fetch("/api/todos");
      return response.json();
    },
    schema,
    queryClient,
    getKey: (item) => item.id,
  }),
);

const queryUtils = queryCollection.utils;
