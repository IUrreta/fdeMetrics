export async function GET(request: Request) {
  const apiBase = process.env.API_BASE_URL!;
  const apiKey  = process.env.API_KEY!;

  // Extraer parámetros de la URL (si quieres filtrar)
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const equipment_type = searchParams.get("equipment_type") || "";

  const r = await fetch(
    `${apiBase}/loads/search?origin=${origin}&destination=${destination}&equipment_type=${equipment_type}`,
    {
      headers: { "x-api-key": apiKey }
    }
  );

  const data = await r.json();
  return Response.json(data, { status: r.status });
}
