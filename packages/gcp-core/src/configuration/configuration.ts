import { ConfigValidator, createLogger, loadConfiguration as initBaseConfig } from "@mondokit/core";
import { isString, last } from "lodash-es";
import { GcpCoreConfiguration } from "./schema.js";
import { SecretsResolver } from "./secrets/secrets.resolver.js";
import { ENV_VAR_CONFIG_ENV, ENV_VAR_PROJECT } from "./variables.js";

export type EnvironmentStrategy = (projectId?: string) => string | undefined;

export interface GcpConfigurationOptions<T extends GcpCoreConfiguration> {
  validator: ConfigValidator<T>;
  configDir?: string;
  projectId?: string;
  environment?: string | EnvironmentStrategy;
  overrides?: Record<string, unknown>;
}

export const getProjectId = (optionsProjectId?: string): string | undefined => {
  if (optionsProjectId) return optionsProjectId;
  if (process.env[ENV_VAR_PROJECT]) return process.env[ENV_VAR_PROJECT];
  if (process.env.GOOGLE_CLOUD_PROJECT) return process.env.GOOGLE_CLOUD_PROJECT;
  // TODO: Support metadata lookup - i.e. so we can support cloud functions
  return undefined;
};

const projectSuffixEnvironment: EnvironmentStrategy = (projectId?: string) => {
  if (!projectId) return undefined;
  return last(projectId.split("-"));
};

const getEnvironment = (
  projectId: string | undefined,
  optionsEnvironment?: string | EnvironmentStrategy,
): string | undefined => {
  if (isString(optionsEnvironment)) return optionsEnvironment;
  if (process.env[ENV_VAR_CONFIG_ENV]) return process.env[ENV_VAR_CONFIG_ENV];

  const strategy = optionsEnvironment || projectSuffixEnvironment;
  return strategy(projectId);
};

const resolveEnvironment = async (options: { projectId?: string; environment?: string | EnvironmentStrategy }) => {
  const logger = createLogger("environmentResolver");

  // 1. Identify projectId
  const projectId = getProjectId(options.projectId);
  logger.info(projectId ? `Loading config for projectId ${projectId}` : "No projectId identified");

  // 2. Identify environment (if possible)
  const environment = getEnvironment(projectId, options.environment);
  logger.info(environment ? `Loading config for environment ${environment}` : "No config environment identified");

  const files = [`${environment}.json`];

  return {
    defaultProps: {
      projectId,
      environment,
    },
    files,
  };
};

const resolveSecrets = async (config: Record<string, unknown>): Promise<Record<string, unknown>> => {
  const logger = createLogger("resolveSecrets");
  logger.info("Resolving all secrets ...");
  const rawProjectId = config.secretsProjectId || config.projectId;
  const secretsProjectId = typeof rawProjectId === "string" ? rawProjectId : undefined;
  const secretsResolver = new SecretsResolver({ projectId: secretsProjectId });
  const configWithSecrets = await secretsResolver.resolveSecrets(config);
  logger.info("Secrets resolved");
  return configWithSecrets;
};

export const initialiseConfiguration = async <T extends GcpCoreConfiguration>(
  options: GcpConfigurationOptions<T>,
): Promise<T> => {
  const { configDir, environment, overrides, projectId, validator } = options;

  return initBaseConfig({
    configDir,
    environmentResolver: () => resolveEnvironment({ environment, projectId }),
    overrides,
    validator,
    valueResolvers: [resolveSecrets],
  });
};
