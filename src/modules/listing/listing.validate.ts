import { z } from 'zod';
import { ListingCategory } from './listing.interface';

export const createListingZodSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.coerce.number(),
  category: z.nativeEnum(ListingCategory),
  condition: z.string(),
  location: z.string(),
  year: z.coerce.number().optional(),
  mileage: z.coerce.number().optional(),
  trans: z.string().optional(),
  color: z.string().optional(),
});

export const updateListingZodSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().optional(),
  category: z.nativeEnum(ListingCategory).optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  sold: z.boolean().optional(),
  isBoosted: z.boolean().optional(),
  boostExpiresAt: z.date().optional(),
  year: z.coerce.number().optional(),
  mileage: z.coerce.number().optional(),
  trans: z.string().optional(),
  color: z.string().optional(),
});

export const deleteListingMediaZodSchema = z.object({
  listingId: z.string(),
  mediaUrl: z.string(),
});
