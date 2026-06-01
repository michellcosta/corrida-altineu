/** PostgREST/Supabase devolve no máximo ~1000 linhas por requisição. */
export const SUPABASE_PAGE_SIZE = 1000

type PageResult<T> = {
  data: T[] | null
  error: { message?: string } | null
}

/**
 * Busca todas as linhas de uma query paginada com `.range(from, to)`.
 */
export async function fetchAllRows<T>(
  runPage: (from: number, to: number) => PromiseLike<PageResult<T>>
): Promise<T[]> {
  const all: T[] = []
  let from = 0

  while (true) {
    const to = from + SUPABASE_PAGE_SIZE - 1
    const { data, error } = await runPage(from, to)
    if (error) throw error
    const page = data ?? []
    if (page.length === 0) break
    all.push(...page)
    if (page.length < SUPABASE_PAGE_SIZE) break
    from += SUPABASE_PAGE_SIZE
  }

  return all
}
