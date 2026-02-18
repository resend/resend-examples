import { Router, Route, Set } from "@redwoodjs/router";
import MainLayout from "src/layouts/MainLayout/MainLayout";

const Routes = () => {
  return (
    <Router>
      <Set wrap={MainLayout}>
        <Route path="/" page={HomePage} name="home" />
        <Route path="/send-email" page={SendEmailPage} name="sendEmail" />
        <Route path="/attachments" page={AttachmentsPage} name="attachments" />
        <Route path="/cid-attachments" page={CidAttachmentsPage} name="cidAttachments" />
        <Route path="/scheduling" page={SchedulingPage} name="scheduling" />
        <Route path="/templates" page={TemplatesPage} name="templates" />
        <Route path="/prevent-threading" page={PreventThreadingPage} name="preventThreading" />
        <Route path="/audiences" page={AudiencesPage} name="audiences" />
        <Route path="/domains" page={DomainsPage} name="domains" />
        <Route path="/double-optin" page={DoubleOptinPage} name="doubleOptin" />
        <Route path="/inbound" page={InboundPage} name="inbound" />
      </Set>
      <Route notfound page={NotFoundPage} />
    </Router>
  );
};

export default Routes;
