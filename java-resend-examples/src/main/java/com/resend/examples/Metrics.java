package com.resend.examples;

import com.resend.Resend;
import com.resend.services.emails.model.EmailsMetricsResponse;
import com.resend.services.emails.model.GetEmailsMetricsOptions;
import com.resend.services.emails.model.MetricsDimension;
import com.resend.services.emails.model.MetricsGranularity;
import io.github.cdimascio.dotenv.Dotenv;

import java.time.LocalDate;
import java.util.List;

public class Metrics {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        try {
            // 1. Account-wide totals for the default date range (no dimensions/filters)
            System.out.println("=== Metrics: Account Totals ===");
            EmailsMetricsResponse totals = resend.emails().metrics();
            System.out.println("Sent: " + totals.getTotals().get("sent")
                    + ", Delivered: " + totals.getTotals().get("delivered"));

            // 2. Daily breakdown for a broadcast, filtered by broadcastIds
            String broadcastId = dotenv.get("RESEND_BROADCAST_ID");
            if (broadcastId != null && !broadcastId.isEmpty()) {
                System.out.println("\n=== Metrics: Broadcast Breakdown ===");
                GetEmailsMetricsOptions options = GetEmailsMetricsOptions.builder()
                        .startDate(LocalDate.now().minusDays(7).toString())
                        .dimensions(MetricsDimension.PERIOD, MetricsDimension.BROADCAST)
                        .granularity(MetricsGranularity.DAILY)
                        .broadcastIds(List.of(broadcastId))
                        .build();

                EmailsMetricsResponse breakdown = resend.emails().metrics(options);
                for (var row : breakdown.getData()) {
                    System.out.println("  " + row.getPeriod() + " (" + row.getBroadcastName() + "): "
                            + "sent=" + row.getMetrics().get("sent")
                            + ", delivered=" + row.getMetrics().get("delivered"));
                }
            } else {
                System.out.println("\nSet RESEND_BROADCAST_ID to see a per-broadcast, per-day breakdown.");
            }

            System.out.println("\nDone!");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}
