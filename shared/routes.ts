import { z } from 'zod';
import { insertCarSchema, insertBookingSchema, insertFineSchema, cars, bookings, fines } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
};

export const api = {
  cars: {
    list: {
      method: 'GET' as const,
      path: '/api/cars' as const,
      input: z.object({
        city: z.string().optional(),
        type: z.string().optional(),
        available: z.enum(['true', 'false']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof cars.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/cars/:id' as const,
      responses: {
        200: z.custom<typeof cars.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/cars' as const,
      input: insertCarSchema,
      responses: {
        201: z.custom<typeof cars.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/cars/:id' as const,
      input: insertCarSchema.partial(),
      responses: {
        200: z.custom<typeof cars.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/cars/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  bookings: {
    list: {
      method: 'GET' as const,
      path: '/api/bookings' as const,
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect & { car?: typeof cars.$inferSelect }>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/bookings/:id' as const,
      responses: {
        200: z.custom<typeof bookings.$inferSelect & { car?: typeof cars.$inferSelect }>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bookings' as const,
      input: insertBookingSchema,
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/bookings/:id/status' as const,
      input: z.object({ bookingStatus: z.enum(['confirmed', 'cancelled', 'completed']) }),
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    }
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users' as const,
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/users/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/users/:id' as const,
      input: z.object({
        role: z.enum(['admin', 'funcionario', 'cliente']).optional(),
        status: z.enum(['pending', 'active']).optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        documento: z.string().optional(),
        contacto: z.string().optional(),
      }),
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/users/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
      },
    },
    updateProfile: {
      method: 'PATCH' as const,
      path: '/api/profile' as const,
      input: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        documento: z.string().optional(),
        contacto: z.string().optional(),
        dataNascimento: z.string().optional(),
        nacionalidade: z.string().optional(),
        nuit: z.string().optional(),
        cartaNumero: z.string().optional(),
        cartaEmissao: z.string().optional(),
        cartaValidade: z.string().optional(),
        cartaPaisEmissor: z.string().optional(),
        cartaFotoUrl: z.string().optional(),
        enderecoCidade: z.string().optional(),
        enderecoBairro: z.string().optional(),
        enderecoNumeroCasa: z.string().optional(),
        enderecoPais: z.string().optional(),
        aceitouTermos: z.string().optional(),
        profileCompleted: z.string().optional(),
      }),
      responses: {
        200: z.any(),
      },
    },
  },
  fines: {
    list: {
      method: 'GET' as const,
      path: '/api/fines' as const,
      responses: {
        200: z.array(z.custom<typeof fines.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/fines' as const,
      input: insertFineSchema,
      responses: {
        201: z.custom<typeof fines.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    userFines: {
      method: 'GET' as const,
      path: '/api/fines/user/:userId' as const,
      responses: {
        200: z.array(z.custom<typeof fines.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/admin/stats' as const,
      responses: {
        200: z.object({
          totalRevenue: z.number(),
          totalBookings: z.number(),
          activeBookings: z.number(),
          totalUsers: z.number(),
          revenueByMethod: z.record(z.number()),
        }),
        401: errorSchemas.unauthorized,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
