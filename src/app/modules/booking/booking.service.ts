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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("The user does not exist");
    }

    if (!user.phone || !user.address) {
      throw new Error("please update your profile to book a tour");
    }

    const newBooking = await Booking.create(
      [{ userId: userId, status: BOOKING_STATUS.PENDING, ...payload }],
      { session }
    );

    const tourBasicCost = await Tour.findById(payload.tourId).select("tourFee");
    const totalCost = tourBasicCost?.tourFee as number;
    const transactionId = getTransactionId();

    const payment = await Payment.create(
      [
        {
          bookingId: newBooking[0]._id,
          status: PAYMENT_STATUS.UNPAID,
          transactionId: transactionId,
          amount: totalCost,
        },
      ],
      { session }
    );

    const updatedBooking = await Booking.findByIdAndUpdate(
      newBooking[0]._id,
      { payment: payment[0]._id },
      { new: true, session }
    )
      .populate("userId", "name email phone address")
      .populate("tourId", "title tourFee")
      .populate("payment");

    const userAddress = (updatedBooking?.userId as any).address;
    const userEmail = (updatedBooking?.userId as any).email;
    const userPhoneNumber = (updatedBooking?.userId as any).phone;
    const userName = (updatedBooking?.userId as any).name;

    const sslPayload: ISSLCommerz = {
      name: userName,
      email: userEmail,
      phoneNumber: userPhoneNumber,
      address: userAddress,
      amount: totalCost,
      transactionId: transactionId,
    };

    const sslPayment = await sslService.sslPaymentInit(sslPayload); // this will hit a POST route and get the GatewayPageURL

    console.log(sslPayment);

    await session.commitTransaction();
    session.endSession();
    return {
      paymentUrl: sslPayment.GatewayPageURL,
      booking: updatedBooking,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const bookingServices = {
  createBookingService,
};
