export { client, clientIsConfigured, configureSip } from "./config/index";
export {
  useSip,
  useSipModel,
  useSipNotification,
  useSipPresence,
  useSipPublic,
} from "./hooks/use-sip";
export type {
  BroadcastNotification,
  Channel,
  ChannelData,
  ChannelReturnType,
  ConfigDefaults,
  Connection,
  ModelEvents,
  ModelName,
  ModelPayload,
} from "./types";
