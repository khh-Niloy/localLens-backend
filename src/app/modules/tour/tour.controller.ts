import { Request, Response } from "express";
import { responseManager } from "../../utils/responseManager";
import { tourServices } from "./tour.service";
import { logger } from "../../utils/logger";
import { ITourSearchQuery } from "./tour.interface";

const createTour = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const imagePaths = files?.map((file) => file.path) || [];

    // Helper function to safely parse JSON or return array
    const parseArrayField = (field: any): any[] => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return field.split(',').map((item: string) => item.trim()).filter(Boolean);
        }
      }
      return [];
    };

    // Helper function to safely parse JSON object
    const parseObjectField = (field: any): any => {
      if (!field) return [];
      if (typeof field === 'object') return field;
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return [];
        }
      }
      return [];
    };

    const tourData = {
      ...req.body,
      guideId: req.user.userId,
      images: imagePaths,
      // Parse array fields safely
      highlights: parseArrayField(req.body.highlights),
      included: parseArrayField(req.body.included),
      notIncluded: parseArrayField(req.body.notIncluded),
      importantInfo: parseArrayField(req.body.importantInfo),
      itinerary: parseObjectField(req.body.itinerary),
      availableDates: parseObjectField(req.body.availableDates),
    };

    const tour = await tourServices.createTourService(tourData);

    responseManager.success(res, {
      statusCode: 201,
      success: true,
      message: "Tour created successfully",
      data: tour,
    });
  } catch (error) {
    logger.log("Error creating tour:", error);
    const statusCode = (error as Error).message.includes("already exists") ? 409 : 500;
    responseManager.error(res, error as Error, statusCode);
  }
};

const getAllTours = async (req: Request, res: Response) => {
  try {
    const tours = await tourServices.getAllToursService();
    logger.log(`Found ${tours.length} tours`); // Debug log
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tours fetched successfully",
      data: tours,
    });
  } catch (error) {
    logger.log("Error fetching tours:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const searchTours = async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query as unknown as ITourSearchQuery;
    const result = await tourServices.searchToursService(searchQuery);
    
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tours searched successfully",
      meta: result.pagination.totalItems,
      data: {
        tours: result.tours,
        pagination: result.pagination
      },
    });
  } catch (error) {
    logger.log("Error searching tours:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const getTourBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const tour = await tourServices.getTourBySlugService(slug);
    
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tour fetched successfully",
      data: tour,
    });
  } catch (error) {
    logger.log("Error fetching tour by slug:", error);
    const statusCode = (error as Error).message === "Tour not found" ? 404 : 500;
    responseManager.error(res, error as Error, statusCode);
  }
};

const getTourById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tour = await tourServices.getTourByIdService(id);
    
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tour fetched successfully",
      data: tour,
    });
  } catch (error) {
    logger.log("Error fetching tour by ID:", error);
    const statusCode = (error as Error).message.includes("not found") || 
                      (error as Error).message.includes("Invalid") ? 404 : 500;
    responseManager.error(res, error as Error, statusCode);
  }
};

const updateTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    const files = req.files as Express.Multer.File[];
    const updateData = { ...req.body };
    
    // Parse array fields safely
    const parseArrayField = (field: any): any[] => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return field.split(',').map((item: string) => item.trim()).filter(Boolean);
        }
      }
      return [];
    };

    // Parse object field safely
    const parseObjectField = (field: any): any => {
      if (!field) return [];
      if (typeof field === 'object') return field;
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return [];
        }
      }
      return [];
    };

    // Process array fields
    if (updateData.highlights) updateData.highlights = parseArrayField(updateData.highlights);
    if (updateData.included) updateData.included = parseArrayField(updateData.included);
    if (updateData.notIncluded) updateData.notIncluded = parseArrayField(updateData.notIncluded);
    if (updateData.importantInfo) updateData.importantInfo = parseArrayField(updateData.importantInfo);
    if (updateData.itinerary) updateData.itinerary = parseObjectField(updateData.itinerary);
    if (updateData.availableDates) updateData.availableDates = parseObjectField(updateData.availableDates);
    
    if (files && files.length > 0) {
      updateData.images = files.map((file) => file.path);
    }

    const tour = await tourServices.updateTourService(id, updateData, userId);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tour updated successfully",
      data: tour,
    });
  } catch (error) {
    logger.log("Error updating tour:", error);
    let statusCode = 500;
    if ((error as Error).message.includes("not found") || (error as Error).message.includes("Invalid")) {
      statusCode = 404;
    } else if ((error as Error).message.includes("only update your own") || (error as Error).message.includes("already exists")) {
      statusCode = 403;
    }
    responseManager.error(res, error as Error, statusCode);
  }
};

const deleteTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const result = await tourServices.deleteTourService(id, userId);

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error) {
    logger.log("Error deleting tour:", error);
    let statusCode = 500;
    if ((error as Error).message.includes("not found") || (error as Error).message.includes("Invalid")) {
      statusCode = 404;
    } else if ((error as Error).message.includes("only delete your own")) {
      statusCode = 403;
    }
    responseManager.error(res, error as Error, statusCode);
  }
};

const getMyTours = async (req: Request, res: Response) => {
  try {
    console.log("=== MY TOURS ENDPOINT CALLED ==="); // Debug log
    const { userId } = req.user;
    console.log(`Controller: Fetching tours for userId: ${userId}`); // Debug log
    logger.log(`Fetching tours for userId: ${userId}`); // Debug log
    
    const tours = await tourServices.getMyToursService(userId);
    console.log(`Controller: Found ${tours.length} tours for user ${userId}`); // Debug log
    logger.log(`Found ${tours.length} tours for user ${userId}`); // Debug log
    
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "My tours fetched successfully",
      data: tours,
    });
  } catch (error) {
    console.log("Error in getMyTours:", error); // Debug log
    logger.log("Error fetching my tours:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const getAllToursForAdmin = async (req: Request, res: Response) => {
  try {
    const tours = await tourServices.getAllToursForAdminService();
    
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "All tours fetched successfully",
      data: tours,
    });
  } catch (error) {
    logger.log("Error fetching all tours for admin:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const getTourEnums = async (req: Request, res: Response) => {
  try {
    const { TOUR_CATEGORY, TOUR_STATUS } = await import("./tour.interface");
    
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Tour enums fetched successfully",
      data: {
        categories: Object.values(TOUR_CATEGORY),
        statuses: Object.values(TOUR_STATUS)
      },
    });
  } catch (error) {
    logger.log("Error fetching tour enums:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const debugAllTours = async (req: Request, res: Response) => {
  try {
    console.log("\n=== DEBUG ALL TOURS ENDPOINT CALLED ===");
    const { Tour } = await import("./tour.model");
    const allTours = await Tour.find({}).select('title status active createdAt guideId');
    const count = await Tour.countDocuments();
    
    // Also test the specific guideId from your tour
    const specificGuideId = "693bde1b3c1c654202473778";
    const toursForSpecificGuide = await Tour.find({ 
      guideId: new Types.ObjectId(specificGuideId) 
    }).select('title guideId');
    
    console.log(`Debug: Total tours: ${count}`);
    console.log(`Debug: Tours for specific guide ${specificGuideId}: ${toursForSpecificGuide.length}`);
    
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: `Debug: Found ${count} total tours in database`,
      data: {
        totalCount: count,
        allTours: allTours.map(t => ({
          id: t._id,
          title: t.title,
          guideId: t.guideId.toString(),
          status: t.status,
          active: t.active,
          createdAt: t.createdAt
        })),
        specificGuideTest: {
          guideId: specificGuideId,
          foundTours: toursForSpecificGuide.length,
          tours: toursForSpecificGuide.map(t => ({
            id: t._id,
            title: t.title,
            guideId: t.guideId.toString()
          }))
        }
      },
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    logger.log("Error in debug endpoint:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const debugUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Debug: Current user info from token",
      data: user,
    });
  } catch (error) {
    logger.log("Error in debug user endpoint:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const testMyTours = async (req: Request, res: Response) => {
  try {
    console.log("=== TEST MY TOURS ENDPOINT CALLED ==="); // Debug log
    
    // Return mock data to test frontend
    const mockTours = [
      {
        _id: "693c140556f745998fdb02ab",
        title: "Test Tour",
        description: "Test Description",
        tourFee: 23,
        status: "ACTIVE",
        createdAt: new Date(),
        images: ["https://via.placeholder.com/300"]
      }
    ];
    
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Test tours fetched successfully",
      data: mockTours,
    });
  } catch (error) {
    console.log("Error in testMyTours:", error);
    responseManager.error(res, error as Error, 500);
  }
};

const getMyToursForAnyRole = async (req: Request, res: Response) => {
  try {
    console.log("\n=== MY TOURS FOR ANY ROLE ENDPOINT CALLED ===");
    console.log(`Request URL: ${req.originalUrl}`);
    console.log(`Request method: ${req.method}`);
    
    const { userId, role } = req.user;
    console.log(`User role: ${role}, userId: ${userId}`);
    
    if (role === 'GUIDE') {
      console.log(`Processing GUIDE request for userId: ${userId}`);
      // For guides, return their created tours
      const tours = await tourServices.getMyToursService(userId);
      console.log(`Controller: Found ${tours.length} tours for guide ${userId}`);
      
      responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "My tours fetched successfully",
        data: tours,
      });
    } else if (role === 'TOURIST') {
      // For tourists, return empty array for now (later we'll add bookings)
      console.log(`Tourist ${userId} accessing my tours - returning empty for now`);
      
      responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "My bookings fetched successfully (empty for now)",
        data: [],
      });
    } else {
      console.log(`Processing ADMIN request`);
      // For admins, return all tours
      const tours = await tourServices.getAllToursForAdminService();
      
      responseManager.success(res, {
        statusCode: 200,
        success: true,
        message: "All tours fetched successfully",
        data: tours,
      });
    }
  } catch (error) {
    console.error("Error in getMyToursForAnyRole:", error);
    responseManager.error(res, error as Error, 500);
  }
};

export const TourController = {
  createTour,
  getAllTours,
  searchTours,
  getTourBySlug,
  getTourById,
  updateTour,
  deleteTour,
  getMyTours,
  getAllToursForAdmin,
  getTourEnums,
  debugAllTours,
  debugUser,
  testMyTours,
  getMyToursForAnyRole
};
