export const normalizeServerErrors = (error) => {
  const errors = error?.response?.data?.errors;
  if (!errors || typeof errors !== "object") {
    return {};
  }

  const normalized = {};
  Object.entries(errors).forEach(([field, messages]) => {
    if (Array.isArray(messages)) {
      const message = messages.find((entry) => entry) || "";
      if (message) {
        normalized[field] = String(message);
      }
      return;
    }
    if (messages) {
      normalized[field] = String(messages);
    }
  });

  return normalized;
};

