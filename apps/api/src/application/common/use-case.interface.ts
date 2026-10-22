/** A single application use case: receives `TInput` and produces `TOutput`. */
export interface IUseCase<TInput, TOutput> {
  handle(data: TInput): Promise<TOutput>;
}
