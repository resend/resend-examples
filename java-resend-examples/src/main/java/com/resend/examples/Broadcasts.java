package com.resend.examples;

import com.resend.Resend;
import com.resend.core.net.ListParams;
import com.resend.services.broadcasts.model.Broadcast;
import com.resend.services.broadcasts.model.BroadcastClickedLink;
import com.resend.services.broadcasts.model.ListBroadcastClickedLinksResponseSuccess;
import io.github.cdimascio.dotenv.Dotenv;

public class Broadcasts {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        String broadcastId = dotenv.get("RESEND_BROADCAST_ID", "your-broadcast-id");

        try {
            // 1. List broadcasts
            System.out.println("=== Listing Broadcasts ===");
            var broadcasts = resend.broadcasts().list();
            for (Broadcast broadcast : broadcasts.getData()) {
                System.out.println("  - " + broadcast.getId() + " (" + broadcast.getStatus() + ")");
            }

            // 2. List a broadcast's clicked links, ranked by total clicks
            System.out.println("\n=== Listing Broadcast Clicked Links ===");
            ListBroadcastClickedLinksResponseSuccess clickedLinks = resend.broadcasts().clickedLinks(broadcastId);
            for (BroadcastClickedLink link : clickedLinks.getData()) {
                System.out.println("  - " + link.getUrl() + ": " + link.getClicks()
                        + " clicks (" + link.getUniqueClicks() + " unique)");
            }

            // 3. Paginate through clicked links with a limit
            System.out.println("\n=== Paginating Clicked Links ===");
            ListParams pageParams = ListParams.builder().limit(1).build();
            ListBroadcastClickedLinksResponseSuccess firstPage = resend.broadcasts().clickedLinks(broadcastId, pageParams);
            System.out.println("Has more: " + firstPage.getHasMore());

            if (Boolean.TRUE.equals(firstPage.getHasMore()) && !firstPage.getData().isEmpty()) {
                // `id` on each clicked link is an opaque pagination cursor for that row,
                // not an entity id — use it with `after`/`before` to page through results.
                String lastCursor = firstPage.getData().get(firstPage.getData().size() - 1).getId();
                ListParams nextPageParams = ListParams.builder().limit(1).after(lastCursor).build();
                ListBroadcastClickedLinksResponseSuccess nextPage = resend.broadcasts().clickedLinks(broadcastId, nextPageParams);
                System.out.println("Next page has " + nextPage.getData().size() + " link(s)");
            }

            System.out.println("\nDone! Broadcast clicked links example complete.");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}
