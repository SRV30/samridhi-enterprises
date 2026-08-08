import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const StripePaymentForm = ({ clientSecret, orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/my-orders`,
      },
    });

    if (error) {
      toast.error(error.message || "An unexpected error occurred.");
    } else {
      // The return_url handles success redirect automatically
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        disabled={isProcessing || !stripe || !elements}
        className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isProcessing ? "Processing Payment..." : "Pay Now"}
      </button>
    </form>
  );
};

export default StripePaymentForm;
