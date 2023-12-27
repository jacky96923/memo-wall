export function toStringField(
  field: string[] | string | undefined,
): string | undefined {
  if (Array.isArray(field)) {
    field = field[0]
  }
  if (field) return field
}

export function toArray<T>(data: T[] | T | undefined): T[] {
  if (Array.isArray(data)) return data
  if (data) return [data]
  return []
}
