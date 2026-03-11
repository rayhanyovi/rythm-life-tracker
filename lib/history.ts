type HistoryCursorPayload = {
  completedAt: string;
  id: string;
};

export function encodeHistoryCursor(payload: HistoryCursorPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeHistoryCursor(cursor: string) {
  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    ) as Partial<HistoryCursorPayload>;

    if (
      typeof parsed.id !== "string" ||
      typeof parsed.completedAt !== "string" ||
      !parsed.id ||
      !parsed.completedAt
    ) {
      return null;
    }

    return {
      id: parsed.id,
      completedAt: parsed.completedAt,
    };
  } catch {
    return null;
  }
}
