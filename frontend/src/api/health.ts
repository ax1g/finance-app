export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch("/api/v1/health")
    return res.ok
  } catch {
    return false
  }
}
