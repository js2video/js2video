import { z, ZodError } from "zod";

/**
 * Validates template params
 * @param {Object} params
 * @throws {Error} If one or more params are invalid.
 */
function validateParams(params) {
  try {
    const sizeSchema = z
      .object({
        width: z
          .number()
          .int()
          .min(10, { message: "Param 'width' must be min. 10" }),
        height: z
          .number()
          .int()
          .min(10, { message: "Param 'height' must be min. 10" }),
      })
      .refine((data) => data.width * data.height <= 8294400, {
        message: "Params 'width' * 'height' must be max 8,294,400",
        path: ["width", "height"],
      });

    const mainSchema = z.object({
      size: sizeSchema,
      bitrate: z
        .number()
        .int()
        .min(1_000, {
          message: "Param 'bitrate' must be min 1,000",
        })
        .max(20_000_000, {
          message: "Param 'bitrate' must be max. 20,000,000",
        }),
      fps: z
        .number()
        .min(5, { message: "Param 'fps' must be min 5" })
        .max(60, { message: "Param 'fps' must be max 60" }),
    });

    mainSchema.parse(params);
  } catch (err) {
    if (err instanceof ZodError) {
      throw err.errors.map((e) => e.message);
    } else {
      throw err;
    }
  }
}

export { validateParams };
