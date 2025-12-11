import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";


const successPaymentService = async (query: Record<string, string>) => {
  const session = await Payment.startSession();
  session.startTransaction();
  try {
    const paymentRecord = await Payment.findOne({
      transactionId: query.transactionId,
    });
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentRecord?._id,
      { status: PAYMENT_STATUS.PAID },
      { new: true, session }
    );

    if (!updatedPayment) {
      throw new Error("Booking not found");
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      paymentRecord?.bookingId,
      { status: BOOKING_STATUS.COMPLETE },
      { new: true, session }
    )
      .populate("tour", "title")
      .populate("user", "name email");

    if (!updatedBooking) {
      throw new Error("Booking not found");
    }

    await session.commitTransaction();
    session.endSession();

    return { success: true, message: "payment success" };
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    throw (error as Error).message;
  }
};

const failPaymentService = async (query: Record<string, string>) => {
  const session = await Payment.startSession();
  session.startTransaction();
  try {
    const paymentRecord = await Payment.findOne({
      transactionId: query.transactionId,
    });
    await Payment.findByIdAndUpdate(
      paymentRecord?._id,
      { status: PAYMENT_STATUS.FAILED },
      { new: true, session }
    );

    await Booking.findByIdAndUpdate(
      paymentRecord?.bookingId,
      { status: BOOKING_STATUS.FAILED },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return { success: false, message: "payment fail" };
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    throw (error as Error).message;
  }
};

const cancelPaymentService = async (query: Record<string, string>) => {
  const session = await Payment.startSession();
  session.startTransaction();
  try {
    const paymentRecord = await Payment.findOne({
      transactionId: query.transactionId,
    });
    await Payment.findByIdAndUpdate(
      paymentRecord?._id,
      { status: PAYMENT_STATUS.CANCELLED },
      { new: true, session }
    );

    await Booking.findByIdAndUpdate(
      paymentRecord?.bookingId,
      { status: BOOKING_STATUS.CANCEL },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return { success: false, message: "payment cancel" };
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    throw (error as Error).message;
  }
};

export const paymentServices = {
  successPaymentService,
  failPaymentService,
  cancelPaymentService,
};
