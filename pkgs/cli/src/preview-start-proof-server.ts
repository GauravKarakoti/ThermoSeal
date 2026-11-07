import path from "node:path";
import { DockerComposeEnvironment, Wait } from "testcontainers";
import { run } from "./cli.js";
import { currentDir, PreviewConfig } from "./config.js";
import { createLogger } from "./logger-utils.js";
import { isDevcontainer, isProofServerRunning } from "./proof-server-utils.js";

const config = new PreviewConfig();
const logger = await createLogger(config.logDir);

if (await isProofServerRunning(config.proofServer)) {
  logger.info(
    `A proof server is already running at ${config.proofServer}; reusing it instead of starting a new one.`,
  );
  await run(config, logger);
} else {
  const containerName = isDevcontainer()
    ? "thermoseal-devcontainer-proof-server"
    : "thermoseal-isolated-proof-server";
  const dockerEnv = new DockerComposeEnvironment(
    path.resolve(currentDir, ".."),
    isDevcontainer() ? "proof-server.devcontainer.yml" : "proof-server.yml",
  )
    .withEnvironment({ DEVCONTAINER_HOST_ID: process.env.HOSTNAME ?? "" })
    .withWaitStrategy(
      containerName,
      Wait.forLogMessage(
        "Actix runtime found; starting in Actix runtime",
        1,
      ).withStartupTimeout(300_000),
    );
  await run(config, logger, dockerEnv);
}