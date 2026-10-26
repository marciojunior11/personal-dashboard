/**
 * Groups writes into one transaction: everything `work` writes is committed
 * together, or rolled back if it throws. Repositories called inside `work`
 * join the transaction on their own, so use cases never see how it is done.
 */
export interface IUnitOfWork {
  run<T>(work: () => Promise<T>): Promise<T>;
}
