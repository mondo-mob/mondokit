import { LazyProvider } from "@mondokit/gcp-core";
import { MutexService } from "@mondokit/gcp-firestore";

export const mutexServiceProvider = new LazyProvider(
  () =>
    new MutexService({
      expirySeconds: 5 * 60,
    })
);
