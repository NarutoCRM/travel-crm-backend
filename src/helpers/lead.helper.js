const generateLeadCode = () => {
  const timestamp = Date.now();

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `LEAD-${timestamp}-${random}`;
};

const parseTravelDate = (date) => {
  if (!date) {
    return null;
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error("Invalid travel date");
    }

    return parsedDate;
  }

  // Full ISO DateTime
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid travel date");
  }

  return parsedDate;
};

export {
  generateLeadCode,
  parseTravelDate
};