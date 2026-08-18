package com.resend.examples;

import com.resend.Resend;
import com.resend.services.automations.model.Automation;
import com.resend.services.automations.model.AutomationConnection;
import com.resend.services.automations.model.AutomationRun;
import com.resend.services.automations.model.AutomationRunStep;
import com.resend.services.automations.model.AutomationStatus;
import com.resend.services.automations.model.AutomationStep;
import com.resend.services.automations.model.AutomationStepResponse;
import com.resend.services.automations.model.CreateAutomationOptions;
import com.resend.services.automations.model.CreateAutomationResponseSuccess;
import com.resend.services.automations.model.DeleteAutomationResponseSuccess;
import com.resend.services.automations.model.GetAutomationRunOptions;
import com.resend.services.automations.model.ListAutomationRunsResponseSuccess;
import com.resend.services.automations.model.ListAutomationsParams;
import com.resend.services.automations.model.ListAutomationsResponseSuccess;
import com.resend.services.automations.model.StopAutomationResponseSuccess;
import com.resend.services.automations.model.UpdateAutomationOptions;
import com.resend.services.automations.model.UpdateAutomationResponseSuccess;
import io.github.cdimascio.dotenv.Dotenv;

public class Automations {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        String templateId = dotenv.get("RESEND_TEMPLATE_ID", "your-template-id");

        try {
            // 1. Create the automation, disabled so it does not run while we build it
            System.out.println("=== Creating Automation ===");
            CreateAutomationOptions createParams = CreateAutomationOptions.builder()
                    .name("Welcome series")
                    .status(AutomationStatus.DISABLED)
                    .steps(
                            AutomationStep.trigger("start")
                                    .eventName("user.created")
                                    .build(),
                            AutomationStep.sendEmail("welcome")
                                    .template(templateId)
                                    .build())
                    .connections(
                            AutomationConnection.builder()
                                    .from("start")
                                    .to("welcome")
                                    .build())
                    .build();

            CreateAutomationResponseSuccess created = resend.automations().create(createParams);
            String automationId = created.getId();
            System.out.println("Automation created: " + automationId);

            // 2. Enable the automation
            System.out.println("\n=== Enabling Automation ===");
            UpdateAutomationOptions updateParams = UpdateAutomationOptions.builder()
                    .id(automationId)
                    .status(AutomationStatus.ENABLED)
                    .build();

            UpdateAutomationResponseSuccess updated = resend.automations().update(updateParams);
            System.out.println("Automation enabled: " + updated.getId());

            // 3. Read the automation back, including its steps and connections
            System.out.println("\n=== Automation Details ===");
            Automation automation = resend.automations().get(automationId);
            System.out.println("Name: " + automation.getName());
            System.out.println("Status: " + automation.getStatus().getValue());

            System.out.println("Steps:");
            for (AutomationStepResponse step : automation.getSteps()) {
                System.out.println("  - " + step.getKey() + " (" + step.getType().getValue() + ")");
            }

            System.out.println("Connections:");
            for (AutomationConnection connection : automation.getConnections()) {
                System.out.println("  - " + connection.getFrom() + " -> " + connection.getTo());
            }

            // 4. List automations, then narrow the list down by status
            System.out.println("\n=== Listing Automations ===");
            ListAutomationsResponseSuccess automations = resend.automations().list();
            System.out.println("Found " + automations.getData().size() + " automation(s)");

            ListAutomationsParams enabledParams = ListAutomationsParams.builder()
                    .status(AutomationStatus.ENABLED)
                    .limit(10)
                    .build();

            ListAutomationsResponseSuccess enabled = resend.automations().list(enabledParams);
            System.out.println("Found " + enabled.getData().size() + " enabled automation(s)");

            // 5. List the runs for this automation
            System.out.println("\n=== Listing Runs ===");
            ListAutomationRunsResponseSuccess runs = resend.automations().listRuns(automationId);
            System.out.println("Found " + runs.getData().size() + " run(s)");

            // 6. Inspect the first run, if the trigger event has fired at least once
            if (!runs.getData().isEmpty()) {
                String runId = runs.getData().get(0).getId();

                System.out.println("\n=== Run Details: " + runId + " ===");
                AutomationRun run = resend.automations().getRun(
                        GetAutomationRunOptions.builder()
                                .automationId(automationId)
                                .runId(runId)
                                .build());

                System.out.println("Status: " + run.getStatus().getValue());

                var runSteps = run.getSteps();
                if (runSteps != null && !runSteps.isEmpty()) {
                    System.out.println("Step statuses:");
                    for (AutomationRunStep runStep : runSteps) {
                        System.out.println("  - " + runStep.getKey()
                                + " (" + runStep.getType().getValue() + "): " + runStep.getStatus());
                    }
                }
            } else {
                System.out.println("No runs yet - a run starts when a 'user.created' event arrives.");
            }

            // 7. Stop the automation
            System.out.println("\n=== Stopping Automation ===");
            StopAutomationResponseSuccess stopped = resend.automations().stop(automationId);
            System.out.println("Automation stopped: " + stopped.getId()
                    + " (status: " + stopped.getStatus().getValue() + ")");

            // 8. Delete the automation
            System.out.println("\n=== Deleting Automation ===");
            DeleteAutomationResponseSuccess deleted = resend.automations().remove(automationId);
            System.out.println("Automation deleted: " + deleted.getId()
                    + " (deleted: " + deleted.getDeleted() + ")");

            System.out.println("\nDone! Full automation lifecycle complete.");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}
