/**
 * Automatic SLA priority calculator based on ticket category, keyword sentiment, and waiting duration.
 */
export class TicketPriorityCalculator {
  static URGENT_KEYWORDS = ["urgent", "refund", "fraud", "damaged", "defective", "missing", "failed", "broken"];

  /**
   * Determine priority level dynamically based on message contents and topic
   */
  static calculateSuggestedPriority(category, subject = "", initialMessage = "") {
    const combinedText = `${subject} ${initialMessage}`.toLowerCase();
    
    // High-priority categories
    if (["Payment", "Shipping"].includes(category)) {
      return "High";
    }

    // Keyword sentiment check
    const hasUrgentKeyword = TicketPriorityCalculator.URGENT_KEYWORDS.some((kw) =>
      combinedText.includes(kw)
    );

    if (hasUrgentKeyword) {
      return "High";
    }

    if (category === "Order" || category === "Product") {
      return "Medium";
    }

    return "Low";
  }

  /**
   * Escalate priority if ticket has been un-responded for longer than SLA limit (in hours)
   */
  static shouldEscalatePriority(ticket, slaHours = 24) {
    if (ticket.status === "Closed" || ticket.status === "Resolved") return false;
    if (ticket.priority === "High") return false;

    const hoursSinceActivity = (Date.now() - new Date(ticket.lastActivityAt).getTime()) / (1000 * 60 * 60);
    return hoursSinceActivity >= slaHours;
  }
}
