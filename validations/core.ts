import { z, ZodError } from 'zod';

const zId = z.number().int().positive();
const zName = z.string().trim().min(1, 'Necessary').max(100, 'Too long');
const zDate = z.string().trim().optional();
const zPositiveInt = z.number().int().positive();

const parseOrThrow = <T>(schema: z.ZodType<T>, data: unknown): T => {
  const r = schema.safeParse(data);
  if (!r.success) throw r.error;
  return r.data;
};

const validateInput =
  <T>(schema: z.ZodType<T>) =>
  (args: unknown): T =>
    parseOrThrow(schema, args);

const validateOutput =
  <T>(schema: z.ZodType<T>) =>
  (payload: unknown): T =>
    parseOrThrow(schema, payload);

const getZodMessage = (err: unknown, fallback = 'invalid data'): string => {
  if (err instanceof ZodError) return err.issues[0]?.message ?? fallback;
  if (typeof err === 'object' && err && 'message' in err && typeof err.message === 'string')
    return err.message;
  return fallback;
};

export { getZodMessage, validateInput, validateOutput, zDate, zId, zName, zPositiveInt };
