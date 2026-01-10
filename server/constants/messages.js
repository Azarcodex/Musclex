const MESSAGES = {
  // Auth / Tokens
  NO_TOKEN: "No token Provided",
  INVALID_TOKEN: "Invalid token detected",
  ADMIN_NOT_FOUND: "Admin not found",
  VENDOR_NOT_FOUND: "Vendor not found",

  // Generic
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  SERVER_ERROR: "Server error",
  INVALID_ERROR: "Invalid Error",

  // Auth / Login
  ENTER_CREDENTIALS: "Enter Credentials",
  ADMIN_NOT_EXIST: "Admin not exist",
  INVALID_CREDENTIALS: "Invalid Credentials",
  LOGGED_IN_SUCCESS: "loggedIn successfully",
  LOGGED_SUCCESSFULL: "logged successfull",
  ACCOUNT_NOT_VERIFIED: "Account not verified. Verify OTP",
  ACCOUNT_BLOCKED: "Your account is being blocked",

  // Wallet / Payments
  INVALID_AMOUNT: "Invalid amount",
  FAILED_CREATE_WALLET_ORDER: "Failed to create wallet order",
  PAYMENT_SIGNATURE_MISMATCH: "Payment signature mismatch",
  WALLET_UPDATED_SUCCESS: "Wallet updated successfully",
  WALLET_VERIFICATION_FAILED: "Wallet verification failed",

  // OTP / Registration
  NO_EMAIL_AND_TOKEN: "No email and token",
  NO_PENDING_REGISTRATION: "No pending registration",
  INCORRECT_OTP: "Incorrect OTP",
  OTP_EXPIRED: "OTP expired",
  USER_ALREADY_EXISTS: "User already exists",
  REGISTRATION_COMPLETE: "Registration complete. User created and verified.",
  OTP_RESENT: "OTP resent",
  OTP_SENT: "OTP has been sent. Please verify.",
  OTP_SENT_CONFIRM: "OTP has been sent. Please confirm.",

  // User / Profile
  NO_IMAGE_FOUND: "No Image found",
  IMAGE_UPLOADED: "Image uploaded successfully",
  IMAGE_REMOVED: "Image removed successfully",
  UPDATED_SUCCESSFULLY: "Updated Successfully",
  DELETED_SUCCESSFULLY: "Deleted Successfully",
  USER_NOT_FOUND: "User not found",
  OLD_PASSWORD_INCORRECT: "Old password is incorrect",
  NEW_PASSWORD_SAME_AS_OLD: "New password cannot be the same as old password",
  PASSWORD_CHANGED_SUCCESS: "Password changed successfully",
  NO_PROFILE_IMAGE_FOUND: "No profile image found",

  // Orders / Cart / Checkout
  ORDER_NOT_FOUND: "Order not found",
  ORDER_PLACED: "Order placed successfully",
  ORDER_CANCELLED: "Order cancelled successfully",
  CART_EMPTY: "Cart is empty",
  CART_EMPTY_FOR_COUPON: "Cart is empty — cannot apply coupon.",
  ITEM_NOT_FOUND: "Item not found",
  VARIANT_NOT_FOUND: "Variant not found",
  INVALID_SIZE: "Invalid size",
  STOCK_UNAVAILABLE: "Stock Unavailable",

  // Coupon / Offers
  COUPON_CODE_REQUIRED: "Coupon code is required",
  INVALID_COUPON_CODE: "Invalid coupon code",
  COUPON_NOT_ACTIVE: "Coupon is not active",
  COUPON_EXPIRED: "Coupon expired or not valid today",
  COUPON_USAGE_LIMIT_REACHED: "Coupon usage limit reached",
  COUPON_ALREADY_USED: "You have already used this coupon",
  COUPON_APPLIED: "Coupon applied successfully",

  // Misc / Validation
  ALL_FIELDS_REQUIRED: "All fields are required",
  SEARCH_QUERY_REQUIRED: "Search query is required",
  NO_PRODUCTS_FOUND: "No products found",
  INVALID_DISCOUNT_TYPE: "Invalid discount type",
  PERCENT_TOO_HIGH: "Percent discount cannot exceed 80%",
  NOT_FOUND: "Not found",
  UNAUTHORIZED: "Unauthorized",
  // Misc additional
  PLEASE_PROVIDE_EMAIL: "Please provide your email",
  ADDRESS_NOT_FOUND: "Address not found",
  WALLET_PAYMENT_FAILED: "Wallet payment failed!",
  FAILED_TO_SEND_OTP: "Failed to send OTP",
  // Analytics / Dashboard
  DASHBOARD_LOADING_FAILED: "Dashboard loading failed",
};

export default MESSAGES;
