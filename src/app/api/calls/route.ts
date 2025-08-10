export async function GET() {
  const apiBase = process.env.API_BASE_URL!;
  const apiKey  = process.env.API_KEY!;
  console.log(`Fetching calls from ${apiBase} with API key ${apiKey}`);
  const r = await fetch(`${apiBase}/calls`, {
    headers: { "x-api-key": apiKey }
  });
  const data = await r.json();
  return Response.json(data, { status: r.status });
}