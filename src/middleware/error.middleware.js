const errorMiddleware = (error, req, res, next) => {
  console.error("❌ Error:", error);

  // Zod validation error
  if (error?.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues?.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      })) || []
    });
  }

  // Prisma unique constraint
  if (error?.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "A record with this value already exists"
    });
  }

  // Prisma record not found
  if (error?.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found"
    });
  }

  // Known application error
  if (error?.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Unknown server error
  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
};

export {
  errorMiddleware
};