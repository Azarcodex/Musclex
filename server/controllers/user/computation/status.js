import { statusPriority } from "../OrderController.js";

export const computeOrderStatus = (items) => {
  if (!items || items.length === 0) return "Pending";

  const statuses = items.map((item) => item.status);

  // If ALL items are Cancelled → order = Cancelled
  if (statuses.every((s) => s === "Cancelled")) {
    return "Cancelled";
  }

  //  If ALL items Delivered → order = Delivered
  if (statuses.every((s) => s === "Delivered")) {
    return "Delivered";
  }

  //  If returning
  if (statuses.some((s) => s === "Returned")) {
    const chances = statuses.every(
      (s) => s === "Returned" || s === "Delivered"
    );
    if (chances) {
      return "Returned";
    }
    return statuses.reduce((acc, s) => {
      return statusPriority.indexOf(s) < statusPriority.indexOf(acc) ? s : acc;
    }, statuses[0]);
  }

  return statuses.reduce((acc, s) => {
    return statusPriority.indexOf(s) < statusPriority.indexOf(acc) ? s : acc;
  }, statuses[0]);
};
