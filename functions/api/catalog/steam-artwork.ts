import { handleCatalog, type CatalogContext } from "../../../server/catalog";
export const onRequest = (context: CatalogContext) =>
  handleCatalog(context, "steam-artwork");
