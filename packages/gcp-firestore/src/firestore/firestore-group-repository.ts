import { createLogger } from "@mondokit/gcp-core";
import { FilterOptions, idOnlyQueryOptions, IdQueryOptions, QueryOptions, QueryResponse } from "./firestore-query.js";
import { BaseRepositoryOptions, FirestoreBaseRepository } from "./firestore-base-repository.js";
import { BaseEntity, DocumentIdentifier, GroupEntity } from "./types.js";

/**
 * Repository for perform collection group operations.
 */
export class FirestoreGroupRepository<T extends BaseEntity> extends FirestoreBaseRepository<T> {
  protected readonly logger = createLogger("firestore-group-repository");

  constructor(protected readonly collectionId: string, options?: BaseRepositoryOptions<T>) {
    super(collectionId, options);
  }

  /**
   * Performs a count of all matching documents for a collection group query against the collection id of
   * this repository.
   * @param options query options
   */
  async count(options: Partial<FilterOptions> = {}): Promise<number> {
    return this.getLoader().execGroupCount(this.collectionId, options);
  }

  /**
   * Performs a collection group query against the collection id of this repository.
   * @param options query options
   */
  async query(options: QueryOptions<T> = {}): Promise<QueryResponse<GroupEntity<T>>> {
    const querySnapshot = await this.getLoader().executeGroupQuery<T>(this.collectionId, options);
    return querySnapshot.docs.map((snapshot) => {
      const entity = this.createEntity(snapshot.ref.id, snapshot.data());
      return {
        id: {
          id: snapshot.ref.id,
          parentPath: snapshot.ref.parent.path,
        },
        entity: this.validateLoad(entity),
      };
    });
  }

  /**
   * Performs a collection group query against the collection id of this repository and returns
   * the ids for any matching documents.
   * @param options query options
   */
  async queryForIds(options: IdQueryOptions<T> = {}): Promise<QueryResponse<DocumentIdentifier>> {
    const querySnapshot = await this.getLoader().executeGroupQuery<T>(this.collectionId, idOnlyQueryOptions(options));
    return querySnapshot.docs.map(({ ref }) => ({ id: ref.id, parentPath: ref.parent.path }));
  }
}
