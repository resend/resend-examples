import { Router } from "express";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const apiKeysRouter = Router();

// GET /api-keys — list all API keys
apiKeysRouter.get("/", async (_req, res) => {
  const { data, error } = await resend.apiKeys.list();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ success: true, apiKeys: data?.data ?? [] });
});

// POST /api-keys — create an API key
apiKeysRouter.post("/", async (req, res) => {
  const { name, permission } = req.body;

  if (!name) {
    res.status(400).json({ error: "Missing required field: name" });
    return;
  }

  const { data, error } = await resend.apiKeys.create({
    name,
    permission,
  });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // Token is only ever returned here, on creation — it cannot be retrieved again later.
  res.json({ success: true, id: data?.id, token: data?.token });
});

// PATCH /api-keys/:id — rename an API key
apiKeysRouter.patch("/:id", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: "Missing required field: name" });
    return;
  }

  // Only `name` is patchable — never forward `permission`/`domainId` from the
  // request body here, or a leaked key could widen another key's scope.
  const { data, error } = await resend.apiKeys.update(req.params.id, {
    name,
  });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ success: true, id: data?.id ?? req.params.id, name: data?.name ?? name });
});

// DELETE /api-keys/:id — remove an API key
apiKeysRouter.delete("/:id", async (req, res) => {
  const { error } = await resend.apiKeys.remove(req.params.id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ success: true, id: req.params.id });
});
