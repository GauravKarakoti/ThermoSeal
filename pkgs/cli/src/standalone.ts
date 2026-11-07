import path from "node:path";
import { DockerComposeEnvironment, Wait } from "testcontainers";
import { run } from "./cli.js";
import { currentDir, StandaloneConfig } from "./config.js";
import { createLogger } from "./logger-utils.js";

const config = new StandaloneConfig();
const dockerEnv = new DockerComposeEnvironment(
  path.resolve(currentDir, ".."),
  "standalone.yml",
)
  .withWaitStrategy(
    "thermoseal-proof-server",
    Wait.forLogMessage("Actix runtime found; starting in Actix runtime", 1),
  )
  .withWaitStrategy(
    "thermoseal-indexer",
    Wait.forLogMessage(/starting indexing/, 1),
  );
const logger = await createLogger(config.logDir);
await run(config, logger, dockerEnv);