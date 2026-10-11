import { handleSteam, type SteamContext } from "../../../server/steam";
export const onRequest = (context: SteamContext) =>
  handleSteam(context, "achievement-batch");
