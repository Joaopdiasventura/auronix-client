export interface FindManyDto<T, TCursor = Partial<T>> {
  data: T[];
  next: TCursor | null;
}
