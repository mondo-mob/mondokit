import { LazyProvider } from "@mondokit/gcp-core";
import { OAuth2Client } from "google-auth-library";

export const googleAuthClientProvider = new LazyProvider(() => new OAuth2Client());
