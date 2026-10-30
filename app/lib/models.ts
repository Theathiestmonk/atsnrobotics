export const ROBOT_MODELS = ["Argo Sonic", "Argo Flex", "Argo Uno"] as const;

export type RobotModel = (typeof ROBOT_MODELS)[number];

export function isRobotModel(value: unknown): value is RobotModel {
  return typeof value === "string" && ROBOT_MODELS.some((model) => model === value);
}
