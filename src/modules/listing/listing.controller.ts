import { Request, Response } from 'express';
import { CatchAsync } from '../../utils/CatchAsync';
import { SendResponse } from '../../utils/SendResponse';
import { listingServices } from './listing.service';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';

// Create Listing
const createListing = CatchAsync(async (req: Request, res: Response) => {
 

  const result = await listingServices.createListingService(
    req.body,
    req.user as JwtPayload,
    req.files as Express.Multer.File[]
  );

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Listing created successfully!',
    data: result,
  });
});

// Get My Listings
const getMyListings = CatchAsync(async (req: Request, res: Response) => {
  const result = await listingServices.getMyListingsService(req.user as JwtPayload);

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'My listings fetched successfully!',
    data: result,
  });
});

// Get All Listings
const getAllListings = CatchAsync(async (req: Request, res: Response) => {


  const sanitizedQuery: Record<string, string> = {};

  for (const key in req.query) {

    const value = req.query[key];

    if (typeof value === 'string') {
      sanitizedQuery[key] = value;
    } else if (Array.isArray(value)) {
      sanitizedQuery[key] = value.join(',');
    }
  }

  const user = req.user as JwtPayload | undefined;
  const { meta, result } = await listingServices.getAllListingsService(
    sanitizedQuery,
    user,
  );

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Listings fetched successfully!',
    meta,
    data: result,
  });
});

// Get Single Listing
const getSingleListing = CatchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as JwtPayload | undefined;
  const result = await listingServices.getSingleListingService(
    id as string,
    user,
  );

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Listing fetched successfully!',
    data: result,
  });
});

// Update Listing
const updateListing = CatchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await listingServices.updateListingService(
    id as string,
    req.body,
    req.user as JwtPayload,
    req.files as Express.Multer.File[]
  );

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Listing updated successfully!',
    data: result,
  });
});

// Get Listings By User Id
const getListingsByUserId = CatchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await listingServices.getListingsByUserIdService(
    userId as string,
  );

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Listings fetched successfully!',
    data: result,
  });
});

// Delete Listing
const deleteListing = CatchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await listingServices.deleteListingService(id as string, req.user as JwtPayload);

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Listing deleted successfully!',
    data: null,
  });
});

// Delete Listing Media
const deleteListingMedia = CatchAsync(async (req: Request, res: Response) => {
  const { listingId, mediaUrl } = req.query;
  const result = await listingServices.deleteListingMediaService(
    listingId as string,
    mediaUrl as string,
    req.user as JwtPayload,
  );

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Listing media deleted successfully!',
    data: result,
  });
});

// Get Listing Analytics
const getListingAnalytics = CatchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await listingServices.getListingAnalyticsService(id as string);

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Listing analytics fetched successfully!',
    data: result,
  });
});



const getAllListingForadmin = CatchAsync(async (req: Request, res: Response) => {

  const query = req.query as Record<string, any>


  const data = await listingServices.getAllListingForAdmin(query)


  SendResponse(res, {
    message: 'get all',
    statusCode: StatusCodes.OK,
    data: data,
    success: true
  })

})



const listingStats = CatchAsync(async (req : Request , res : Response)=>{

  console.log("listin counts")
  const result = await listingServices.listingStats()

  SendResponse(res , {
    data : result , 
    success : true , 
    message : 'All count of listing',
    statusCode : StatusCodes.OK
  })
})




export const listingControllers = {
  createListing,
  getMyListings,
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
  getListingsByUserId,
  deleteListingMedia,
  getListingAnalytics,


  getAllListingForadmin,
  listingStats
};
