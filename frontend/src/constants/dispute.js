export const DisputeReason = {
  ITEM_NOT_RECEIVED: 'item_not_received',
  ITEM_NOT_AS_DESCRIBED: 'item_not_as_described',
  DAMAGED_ITEM: 'damaged_item',
  COUNTERFEIT_PARTS: 'counterfeit_parts',
  SELLER_UNRESPONSIVE: 'seller_unresponsive',
  BUYER_REFUSING_DELIVERY: 'buyer_refusing_delivery',
  OTHER: 'other',
};

export const DisputeReasonLabels = {
  item_not_received: 'Không nhận được hàng',
  item_not_as_described: 'Hàng không đúng mô tả',
  damaged_item: 'Hàng bị hư hỏng',
  counterfeit_parts: 'Linh kiện giả',
  seller_unresponsive: 'Người bán không phản hồi',
  buyer_refusing_delivery: 'Người mua từ chối nhận hàng',
  other: 'Lý do khác',
};

export const DisputeStatus = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  AWAITING_EVIDENCE: 'awaiting_evidence',
  RESOLVED_BUYER_FAVOR: 'resolved_buyer_favor',
  RESOLVED_SELLER_FAVOR: 'resolved_seller_favor',
  RESOLVED_PARTIAL_REFUND: 'resolved_partial_refund',
  CLOSED: 'closed',
};

export const DisputeStatusLabels = {
  open: 'Chờ xử lý',
  under_review: 'Đang xem xét',
  awaiting_evidence: 'Chờ bằng chứng',
  resolved_buyer_favor: 'Hoàn tiền cho buyer',
  resolved_seller_favor: 'Giữ tiền cho seller',
  resolved_partial_refund: 'Hoàn tiền một phần',
  closed: 'Đã đóng',
};

export const DisputeDecision = {
  BUYER_FAVOR: 'buyer_favor',
  SELLER_FAVOR: 'seller_favor',
  PARTIAL_REFUND: 'partial_refund',
};

export const DisputeDecisionLabels = {
  buyer_favor: 'Có lợi cho người mua (hoàn tiền)',
  seller_favor: 'Có lợi cho người bán (giải ngân)',
  partial_refund: 'Hoàn tiền một phần',
};
