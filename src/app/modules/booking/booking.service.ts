/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose from "mongoose";
import { getTransactionId } from "../../utils/getTransactionId";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { sslService } from "../sslCommerz/sslCommerz.service";
import { Tour } from "../tour/tour.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import { Booking } from "./booking.model";
import { User } from "../users/user.model";

const createBookingService = async (
  payload: Partial<IBooking>,
  userId: string
) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("The user does not exist");
    }

    // Calculate total amount
    const tourBasicCost = await Tour.findById(payload.tourId).select("tourFee");
    const tourFee = tourBasicCost?.tourFee as number;
    const numberOfGuests = payload.numberOfGuests || 1;
    const totalCost = tourFee * numberOfGuests;

    // Create booking without payment - payment happens after tour completion
    const newBooking = await Booking.create({
      userId: userId,
      status: BOOKING_STATUS.PENDING,
      totalAmount: totalCost,
      numberOfGuests: numberOfGuests,
      ...payload,
    });

    const updatedBooking = await Booking.findById(newBooking._id)
      .populate("userId", "name email phone address")
      .populate("tourId", "title tourFee images location")
      .populate("guideId", "name email image");

    return updatedBooking;
  } catch (error) {
    throw error;
  }
};

const getMyBookingsService = async (userId: string, role: string) => {
  let query: any = {};

  if (role === "TOURIST") {
    query = { userId };
  } else if (role === "GUIDE") {
    query = { guideId: userId };
  }

  const bookings = await Booking.find(query)
    .populate(
      "tourId",
      "title images location tourFee maxDuration category slug"
    )
    .populate("userId", "name email phone image")
    .populate("guideId", "name email image phone")
    .populate("payment", "status transactionId amount")
    .sort({ createdAt: -1 });

  return bookings;
};

const getUpcomingBookingsService = async (guideId: string) => {
  const today = new Date().toISOString().split("T")[0];

  const bookings = await Booking.find({
    guideId,
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
    bookingDate: { $gte: today },
  })
    .populate("userId", "name email phone image")
    .populate(
      "tourId",
      "title images location tourFee maxDuration category slug"
    )
    .populate("payment", "status transactionId amount")
    .sort({ bookingDate: 1, bookingTime: 1 });

  return bookings;
};

const getPendingBookingsService = async (guideId: string) => {
  const bookings = await Booking.find({
    guideId,
    status: BOOKING_STATUS.PENDING,
  })
    .populate("userId", "name email phone image")
    .populate(
      "tourId",
      "title images location tourFee maxDuration category slug"
    )
    .populate("payment", "status transactionId amount")
    .sort({ createdAt: -1 });

  return bookings;
};

const getAllGuideBookingsService = async (guideId: string) => {
  const bookings = await Booking.find({
    guideId,
  })
    .populate("userId", "name email phone image address")
    .populate(
      "tourId",
      "title images location tourFee maxDuration category slug"
    )
    .populate("payment", "status transactionId amount")
    .sort({ createdAt: -1 });

  return bookings;
};

const updateBookingStatusService = async (
  bookingId: string,
  status: BOOKING_STATUS,
  userId: string
) => {
  const booking = await Booking.findById(bookingId).populate("guideId", "_id");

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Verify that the user is the guide for this booking
  const guideId = (booking.guideId as any)?._id?.toString();
  if (guideId !== userId) {
    throw new Error("You are not authorized to update this booking");
  }

  // Validate status transition
  if (booking.status === BOOKING_STATUS.COMPLETED) {
    throw new Error("Cannot update a completed booking");
  }

  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new Error("Cannot update a cancelled booking");
  }

  // Only allow CONFIRMED or CANCELLED from PENDING
  if (booking.status === BOOKING_STATUS.PENDING) {
    if (
      status !== BOOKING_STATUS.CONFIRMED &&
      status !== BOOKING_STATUS.CANCELLED
    ) {
      throw new Error("Can only confirm or cancel a pending booking");
    }
  }

  // Allow COMPLETED from CONFIRMED (after tour)
  if (booking.status === BOOKING_STATUS.CONFIRMED) {
    if (status === BOOKING_STATUS.COMPLETED) {
      // When marking as completed, create payment record for tourist to pay
      const existingPayment = await Payment.findOne({ bookingId });

      if (!existingPayment) {
        const transactionId = getTransactionId();
        const payment = await Payment.create({
          bookingId,
          status: PAYMENT_STATUS.UNPAID,
          transactionId,
          amount: booking.totalAmount,
        });

        // Update booking with payment reference
        const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          { status, payment: payment._id },
          { new: true }
        )
          .populate("userId", "name email phone image address")
          .populate(
            "tourId",
            "title images location tourFee maxDuration category slug"
          )
          .populate("guideId", "name email image phone")
          .populate("payment", "status transactionId amount");

        return updatedBooking;
      }
    } else if (status !== BOOKING_STATUS.CANCELLED) {
      throw new Error("Can only complete or cancel a confirmed booking");
    }
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    { status },
    { new: true }
  )
    .populate("userId", "name email phone image")
    .populate(
      "tourId",
      "title images location tourFee maxDuration category slug"
    )
    .populate("guideId", "name email image phone")
    .populate("payment", "status transactionId amount");

  return updatedBooking;
};

const getAllBookingsService = async () => {
  const bookings = await Booking.find()
    .populate("userId", "name email phone image")
    .populate(
      "tourId",
      "title images location tourFee maxDuration category slug"
    )
    .populate("guideId", "name email image phone")
    .populate("payment", "status transactionId amount")
    .sort({ createdAt: -1 });

  return bookings;
};

const getBookingByIdService = async (bookingId: string, userId: string) => {
  const booking = await Booking.findById(bookingId)
    .populate("userId", "name email phone image")
    .populate(
      "tourId",
      "title images location tourFee maxDuration category slug"
    )
    .populate("guideId", "name email image phone")
    .populate("payment", "status transactionId amount");

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Verify user has access to this booking
  const bookingUserId = (booking.userId as any)?._id?.toString();
  const bookingGuideId = (booking.guideId as any)?._id?.toString();

  if (bookingUserId !== userId && bookingGuideId !== userId) {
    throw new Error("You are not authorized to view this booking");
  }

  return booking;
};

const initiatePaymentForCompletedBooking = async (
  bookingId: string,
  userId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId)
      .populate("userId", "name email phone address")
      .populate("payment");

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify user is the tourist who made the booking
    const bookingUserId = (booking.userId as any)?._id?.toString();
    if (bookingUserId !== userId) {
      throw new Error("You are not authorized to pay for this booking");
    }

    // Only allow payment for completed bookings
    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      throw new Error("Payment can only be initiated for completed tours");
    }

    // Check if payment already exists
    let payment = booking.payment;

    if (!payment) {
      // Create payment record
      const transactionId = getTransactionId();
      const newPayment = await Payment.create(
        [
          {
            bookingId,
            status: PAYMENT_STATUS.UNPAID,
            transactionId,
            amount: booking.totalAmount,
          },
        ],
        { session }
      );

      await Booking.findByIdAndUpdate(
        bookingId,
        { payment: newPayment[0]._id },
        { session }
      );

      payment = newPayment[0]._id;
    }

    // Check if payment is already paid
    const paymentRecord = await Payment.findById(payment);
    if (paymentRecord?.status === PAYMENT_STATUS.PAID) {
      throw new Error("This booking has already been paid");
    }

    // Get user details for payment gateway
    const userAddress = (booking.userId as any).address;
    const userEmail = (booking.userId as any).email;
    const userPhoneNumber = (booking.userId as any).phone;
    const userName = (booking.userId as any).name;

    const sslPayload: ISSLCommerz = {
      name: userName,
      email: userEmail,
      phoneNumber: userPhoneNumber,
      address: userAddress,
      amount: booking.totalAmount,
      transactionId:
        (paymentRecord as any)?.transactionId || getTransactionId(),
    };

    const sslPayment = await sslService.sslPaymentInit(sslPayload);

    await session.commitTransaction();
    session.endSession();

    return {
      paymentUrl: sslPayment.GatewayPageURL,
      booking,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const bookingServices = {
  createBookingService,
  getMyBookingsService,
  getUpcomingBookingsService,
  getPendingBookingsService,
  getAllGuideBookingsService,
  updateBookingStatusService,
  getAllBookingsService,
  getBookingByIdService,
  initiatePaymentForCompletedBooking,
};
