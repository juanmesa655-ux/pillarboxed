function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof TypeError) {
      return Response.json({ error: "invalid-data" }, { status: 400 });
    }
    throw error;
  }

  if (!isRecord(payload) || typeof payload.email !== "string") {
    return Response.json({ error: "invalid-data" }, { status: 400 });
  }

  if (
    process.env.NODE_ENV !== "development" ||
    typeof process.env.DEMO_INITIAL_ADMIN_EMAIL !== "string"
  ) {
    return Response.json(
      { role: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const configuredEmail = process.env.DEMO_INITIAL_ADMIN_EMAIL.trim().toLowerCase();
  const submittedEmail = payload.email.trim().toLowerCase();

  return Response.json(
    {
      role:
        configuredEmail.length > 0 && submittedEmail === configuredEmail
          ? "administrador"
          : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
